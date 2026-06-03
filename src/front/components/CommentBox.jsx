import React, { useState, useEffect } from "react";
import "../styles/commentBox.css";

export const CommentBox = ({ spotId, token }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const getComments = () => {
        if (!spotId || !token) return;

        fetch(`${API_URL}api/spots/${spotId}/comments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setComments(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error cargando comentarios:", err));
    };

    useEffect(() => {
        getComments();
    }, [spotId, token]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        const endpoint = replyingTo
            ? `${API_URL}api/comments/${replyingTo.id}/reply`
            : `${API_URL}api/spots/${spotId}/comments`;

     fetch(endpoint, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ contenido: newComment })
})
    .then(async (res) => {
        const data = await res.json();

        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);

        if (!res.ok) {
            alert(data.msg || "Error creando comentario");
            return null;
        }

        return data;
    })
    .then(data => {
        if (data?.id) {
            setNewComment("");
            setReplyingTo(null);
            getComments();
        }
    })
    .catch(err => console.error("Error publicando comentario:", err));
    };

    const startEdit = (comment) => {
        setEditingComment(comment);
        setEditText(comment.contenido);
        setReplyingTo(null);
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditText("");
    };

    const saveEdit = () => {
        if (!editingComment || !editText.trim()) return;

        fetch(`${API_URL}api/comments/${editingComment.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ contenido: editText })
        })
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setEditingComment(null);
                    setEditText("");
                    getComments();
                }
            })
            .catch(err => console.error("Error editando comentario:", err));
    };

    const deleteComment = (commentId) => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar este comentario?");
        if (!confirmDelete) return;

        fetch(`${API_URL}api/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(() => getComments())
            .catch(err => console.error("Error eliminando comentario:", err));
    };

    const getAuthorName = (comment) => {
        if (comment.autor) return comment.autor;

        if (comment.user) {
            return `${comment.user.nombre || ""} ${comment.user.apellido || ""}`.trim();
        }

        return "Usuario";
    };

    const renderActions = (comment) => {
        if (!comment.can_edit) return null;

        return (
            <div className="comment__actions">
                <button type="button" onClick={() => startEdit(comment)}>
                    Editar
                </button>

                <button type="button" onClick={() => deleteComment(comment.id)}>
                    Eliminar
                </button>
            </div>
        );
    };

    return (
        <section className="comment-box">
            <div className="comment-box__header">
                <div>
                    <h4>Comentarios</h4>
                    <span>
                        {comments.length} {comments.length === 1 ? "comentario" : "comentarios"}
                    </span>
                </div>
            </div>

            <div className="comment-box__list">
                {comments.length === 0 ? (
                    <div className="comment-box__empty">
                        <p>Sin comentarios aún.</p>
                        <small>Sé el primero en comentar este spot.</small>
                    </div>
                ) : (
                    comments.map(comment => (
                        <article key={comment.id} className="comment">
                            <div className="comment__avatar">
                                {getAuthorName(comment).charAt(0).toUpperCase()}
                            </div>

                            <div className="comment__content">
                                <div className="comment__bubble">
                                    <div className="comment__top">
                                        <strong>@{getAuthorName(comment)}</strong>
                                        {renderActions(comment)}
                                    </div>

                                    {editingComment?.id === comment.id ? (
                                        <div className="edit-box">
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                autoFocus
                                            />

                                            <div className="edit-box__actions">
                                                <button type="button" onClick={cancelEdit}>
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    disabled={!editText.trim()}
                                                >
                                                    Guardar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>{comment.contenido}</p>
                                    )}
                                </div>

                                {editingComment?.id !== comment.id && (
                                    <button
                                        type="button"
                                        className="comment__reply-btn"
                                        onClick={() => setReplyingTo(comment)}
                                    >
                                        Responder
                                    </button>
                                )}

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="comment__replies">
                                        {comment.replies.map(reply => (
                                            <article key={reply.id} className="reply">
                                                <div className="reply__avatar">
                                                    {getAuthorName(reply).charAt(0).toUpperCase()}
                                                </div>

                                                <div className="reply__bubble">
                                                    <div className="comment__top">
                                                        <strong>@{getAuthorName(reply)}</strong>
                                                        {renderActions(reply)}
                                                    </div>

                                                    {editingComment?.id === reply.id ? (
                                                        <div className="edit-box">
                                                            <input
                                                                type="text"
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                autoFocus
                                                            />

                                                            <div className="edit-box__actions">
                                                                <button type="button" onClick={cancelEdit}>
                                                                    Cancelar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={saveEdit}
                                                                    disabled={!editText.trim()}
                                                                >
                                                                    Guardar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>{reply.contenido}</p>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </div>

            {replyingTo && (
                <div className="reply-banner">
                    <span>Respondiendo a @{getAuthorName(replyingTo)}</span>

                    <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <form className="comment-box__form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={
                        replyingTo
                            ? `Responder a @${getAuthorName(replyingTo)}...`
                            : "Escribe un comentario..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <button type="submit" disabled={!newComment.trim()}>
                    Enviar
                </button>
            </form>
        </section>
    );
};
import React, { useState, useEffect } from "react";
import "../styles/commentBox.css";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ConfirmModal } from "../components/ConfirmModal";

export const CommentBox = ({ spotId, token }) => {
    const { dispatch } = useGlobalReducer();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");
    const [commentToDelete, setCommentToDelete] = useState(null);

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const showToast = (message, type = "success") => {
        dispatch({
            type: "show_toast",
            payload: { message, type },
        });
    };

    const getComments = () => {
        if (!spotId || !token) return;

        fetch(`${API_URL}api/spots/${spotId}/comments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setComments(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error("Error loading comments:", err);
                showToast("Error loading comments", "error");
            });
    };

    useEffect(() => {
        getComments();
    }, [spotId, token]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        const isReply = Boolean(replyingTo);

        const endpoint = isReply
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

                if (!res.ok) {
                    showToast(data.msg || "Error posting comment", "error");
                    return null;
                }

                return data;
            })
            .then(data => {
                if (data?.id) {
                    setNewComment("");
                    setReplyingTo(null);
                    getComments();
                    showToast(isReply ? "Reply posted!" : "Comment posted!", "success");
                }
            })
            .catch(err => {
                console.error("Error posting comment:", err);
                showToast("Network error posting comment", "error");
            });
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
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    showToast(data.msg || "Error updating comment", "error");
                    return null;
                }

                return data;
            })
            .then(data => {
                if (data?.id) {
                    setEditingComment(null);
                    setEditText("");
                    getComments();
                    showToast("Comment updated!", "success");
                }
            })
            .catch(err => {
                console.error("Error updating comment:", err);
                showToast("Network error updating comment", "error");
            });
    };

    const deleteComment = (comment) => {
        setCommentToDelete(comment);
    };

    const confirmDeleteComment = () => {
        if (!commentToDelete) return;

        fetch(`${API_URL}api/comments/${commentToDelete.id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    showToast(data.msg || "Error deleting comment", "error");
                    return null;
                }

                return data;
            })
            .then(data => {
                if (data) {
                    getComments();
                    showToast("Comment deleted!", "success");
                    setCommentToDelete(null);
                }
            })
            .catch(err => {
                console.error("Error deleting comment:", err);
                showToast("Network error deleting comment", "error");
            });
    };

    const getAuthorName = (comment) => {
        if (comment.autor) return comment.autor;

        if (comment.user) {
            return `${comment.user.nombre || ""} ${comment.user.apellido || ""}`.trim();
        }

        return "User";
    };

    const renderActions = (comment) => {
        if (!comment.can_edit) return null;

        return (
            <div className="comment__actions">
                <button type="button" onClick={() => startEdit(comment)}>
                    Edit
                </button>

                <button type="button" onClick={() => deleteComment(comment)}>
                    Delete
                </button>
            </div>
        );
    };

    return (
        <section className="comment-box">
            <div className="comment-box__header">
                <div>
                    <h4>Comments</h4>
                    <span>
                        {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </span>
                </div>
            </div>

            <div className="comment-box__list">
                {comments.length === 0 ? (
                    <div className="comment-box__empty">
                        <p>No comments yet.</p>
                        <small>Be the first to comment on this post!</small>
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
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    disabled={!editText.trim()}
                                                >
                                                    Save
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
                                        Reply
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
                                                                    Cancel
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={saveEdit}
                                                                    disabled={!editText.trim()}
                                                                >
                                                                    Save
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
                    <span>Replying to @{getAuthorName(replyingTo)}</span>

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
                            ? `Reply to @${getAuthorName(replyingTo)}...`
                            : "Write a comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <button type="submit" disabled={!newComment.trim()}>
                    Send
                </button>
            </form>
            <ConfirmModal
                isOpen={!!commentToDelete}
                title="Delete comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                danger={true}
                onCancel={() => setCommentToDelete(null)}
                onConfirm={confirmDeleteComment}
            />
        </section>
    );
};
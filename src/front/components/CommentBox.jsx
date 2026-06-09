import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/commentBox.css";
import { ConfirmModal } from "./confirmModal";
import toast from "react-hot-toast";

export const CommentBox = ({ spotId, token }) => {
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const getComments = async () => {
    if (!spotId || !token) return;

    try {
      const res = await fetch(`${API_URL}api/spots/${spotId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Error loading comments");
        return;
      }

      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
      toast.error("Network error loading comments");
    }
  };

  useEffect(() => {
    getComments();
  }, [spotId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim() || submitting) return;

    const endpoint = replyingTo
      ? `${API_URL}api/comments/${replyingTo.id}/reply`
      : `${API_URL}api/spots/${spotId}/comments`;

    try {
      setSubmitting(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contenido: newComment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Error creating comment");
        return;
      }

      setNewComment("");
      setReplyingTo(null);
      await getComments();
      toast.success(replyingTo ? "Reply added" : "Comment added");
    } catch (err) {
      console.error("Error publicando comentario:", err);
      toast.error("Network error creating comment");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment);
    setEditText(comment.contenido || "");
    setReplyingTo(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingComment || !editText.trim() || savingEdit) return;

    try {
      setSavingEdit(true);

      const res = await fetch(`${API_URL}api/comments/${editingComment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contenido: editText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Error updating comment");
        return;
      }

      setEditingComment(null);
      setEditText("");
      await getComments();
      toast.success("Comment updated");
    } catch (err) {
      console.error("Error editando comentario:", err);
      toast.error("Network error updating comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteConfirm = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
  };

  const deleteComment = async () => {
    if (!commentToDelete || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}api/comments/${commentToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Error deleting comment");
        return;
      }

      toast.success("Comment deleted");
      await getComments();
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error("Error eliminando comentario:", err);
      toast.error("Network error deleting comment");
    } finally {
      setDeleting(false);
    }
  };

  const getAuthorName = (comment) => {
    if (comment.autor) return comment.autor;

    if (comment.user) {
      return `${comment.user.nombre || ""} ${comment.user.apellido || ""}`.trim();
    }

    return "Usuario";
  };

  const getAvatar = (comment) => {
    return (
      comment.user?.profile_image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        getAuthorName(comment)
      )}&background=ef3340&color=fff`
    );
  };

  const goToProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const renderAuthor = (comment) => (
    <strong
      onClick={() => goToProfile(comment.user?.id)}
      style={{ cursor: comment.user?.id ? "pointer" : "default" }}
      title={comment.user?.id ? "View profile" : undefined}
    >
      @{getAuthorName(comment)}
    </strong>
  );

  const renderAvatar = (comment, className) => (
    <div
      className={className}
      onClick={() => goToProfile(comment.user?.id)}
      style={{ cursor: comment.user?.id ? "pointer" : "default" }}
      title={comment.user?.id ? "View profile" : undefined}
    >
      <img src={getAvatar(comment)} alt={getAuthorName(comment)} />
    </div>
  );

  const renderActions = (comment) => {
    if (!comment.can_edit) return null;

    return (
      <div className="comment__actions">
        <button type="button" onClick={() => startEdit(comment)}>
          Edit
        </button>

        <button type="button" onClick={() => openDeleteConfirm(comment.id)}>
          Delete
        </button>
      </div>
    );
  };

  const renderEditBox = () => (
    <div className="edit-box">
      <input
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        autoFocus
      />

      <div className="edit-box__actions">
        <button type="button" onClick={cancelEdit} disabled={savingEdit}>
          Cancel
        </button>

        <button
          type="button"
          onClick={saveEdit}
          disabled={!editText.trim() || savingEdit}
        >
          {savingEdit ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );

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
            <small>Be the first to comment on this post.</small>
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment">
              {renderAvatar(comment, "comment__avatar")}

              <div className="comment__content">
                <div className="comment__bubble">
                  <div className="comment__top">
                    {renderAuthor(comment)}
                    {renderActions(comment)}
                  </div>

                  {editingComment?.id === comment.id ? (
                    renderEditBox()
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
                    {comment.replies.map((reply) => (
                      <article key={reply.id} className="reply">
                        {renderAvatar(reply, "reply__avatar")}

                        <div className="reply__bubble">
                          <div className="comment__top">
                            {renderAuthor(reply)}
                            {renderActions(reply)}
                          </div>

                          {editingComment?.id === reply.id ? (
                            renderEditBox()
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

          <button type="button" onClick={() => setReplyingTo(null)}>
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

        <button type="submit" disabled={!newComment.trim() || submitting}>
          {submitting ? "Sending..." : replyingTo ? "Reply" : "Comment"}
        </button>
      </form>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete comment?"
        message="This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={deleteComment}
        onCancel={() => {
          if (deleting) return;
          setShowDeleteConfirm(false);
          setCommentToDelete(null);
        }}
      />
    </section>
  );
};

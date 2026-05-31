import React, { useState, useEffect } from "react";

export const CommentBox = ({ spotId, token }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        if (!spotId || !token) return;
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/spots/${spotId}/comments`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setComments(data) : setComments([]))
        .catch(err => console.error("Error cargando comentarios:", err));
    }, [spotId, token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/spots/${spotId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ contenido: newComment })
        })
        .then(res => res.json())
        .then(data => {
            if (data.id) {
                setComments([...comments, data]);
                setNewComment("");
            }
        })
        .catch(err => console.error("Error al publicar comentario:", err));
    };

    return (
        <div className="mt-5 p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-900">
            <h4 className="text-sm font-semibold mb-3 text-left text-gray-800 dark:text-gray-200">Comentarios</h4>
            <div className="max-h-40 overflow-y-auto mb-3 space-y-2 pr-1 text-left">
                {comments.length === 0 ? (
                    <p className="text-xs text-gray-400 my-1">Sin comentarios aún. ¡Sé el primero!</p>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="text-xs leading-relaxed">
                            <strong className="text-gray-800 dark:text-gray-200">@{c.autor}: </strong>
                            <span className="text-gray-600 dark:text-gray-400">{c.contenido}</span>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Escribe un comentario..." 
                    className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs outline-none focus:border-red-400 dark:text-white"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors">
                    Enviar
                </button>
            </form>
        </div>
    );
};

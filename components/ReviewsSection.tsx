"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
};

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem('mythic-reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTimeout(() => setReviews(parsed), 0);
        }
      } catch (e) {}
    }
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: newReviewName.trim(),
      rating: newReviewRating,
      text: newReviewText.trim(),
      date: new Date().toLocaleDateString('es-ES')
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('mythic-reviews', JSON.stringify(updated));
    
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <section className="bg-[#121824] rounded-2xl p-6 md:p-8 border border-[#1c2534] shadow-xl mt-8 lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-[#ffaa00]" />
        <h3 className="text-2xl font-bold">Reseñas de Clientes</h3>
      </div>
      
      {/* Add Review Form */}
      <form onSubmit={handleAddReview} className="bg-[#0a0f1a] rounded-xl p-5 border border-[#2a3441] mb-8">
        <h4 className="font-bold text-lg mb-4 text-white">Deja tu reseña</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">Tu Nombre</label>
            <input 
              type="text" 
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
              placeholder="Ej. Carlos G." 
              className="w-full bg-[#121824] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">Calificación</label>
            <div className="flex items-center gap-2 h-[50px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReviewRating(star)}
                  className={`transition-colors ${star <= newReviewRating ? 'text-[#ffaa00]' : 'text-gray-600 hover:text-[#ffaa00]/70'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <label className="text-sm font-semibold text-gray-400 block">Comentario</label>
          <textarea 
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="¿Qué te pareció el servicio?" 
            className="w-full bg-[#121824] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all min-h-[100px] resize-y"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-gradient-to-r from-[#2a3441] to-[#344050] hover:from-[#3a4759] hover:to-[#455469] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaa00]"
        >
          Publicar Reseña
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-[#2a3441] rounded-xl">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Aún no hay reseñas. ¡Sé el primero en dejar una!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[#0a0f1a] rounded-xl p-5 border border-[#2a3441]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-white">{review.name}</div>
                  <div className="text-xs text-gray-500">{review.date}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#ffaa00] fill-current' : 'text-gray-700 fill-current'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{review.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

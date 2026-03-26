import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from './firebase';
import { CheckCircle } from 'lucide-react';

export const Feedback: React.FC = () => {
  const { historyId } = useParams<{ historyId: string }>();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState<number | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emojis = ['ðŸ˜Š', 'ðŸ˜ ', 'ðŸ˜Ž', 'ðŸ˜´', 'ðŸ˜”', 'ðŸ˜¡'];

  const handleSubmit = async () => {
    if (!historyId || (!rating && !emoji)) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'history', historyId);
      await updateDoc(docRef, {
        rating,
        emoji,
      });
      navigate('/library');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `history/${historyId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-12">
      <h2 className="text-5xl font-bold text-center">How did you feel?</h2>
      
      <div className="flex flex-col gap-8 items-center bg-white p-12 rounded-[3rem] shadow-xl w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6 w-full">
          <h3 className="text-3xl font-bold">Rate the song</h3>
          <div className="flex justify-between w-full max-w-md">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setRating(num)}
                className={`w-20 h-20 rounded-full text-4xl font-bold flex items-center justify-center border-4 transition-all ${
                  rating === num 
                    ? 'bg-blue-500 text-white border-blue-600 scale-110 shadow-lg' 
                    : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
                }`}
                aria-label={`Rate ${num} out of 5`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-1 bg-gray-200 rounded-full my-4"></div>

        <div className="flex flex-col items-center gap-6 w-full">
          <h3 className="text-3xl font-bold">Pick an emoji</h3>
          <div className="grid grid-cols-3 gap-6">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-6xl p-6 rounded-3xl border-4 transition-all ${
                  emoji === e 
                    ? 'bg-blue-100 border-blue-500 scale-110 shadow-lg' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                aria-label={`Select emoji ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || (!rating && !emoji)}
          className={`mt-8 w-full py-6 rounded-2xl text-3xl font-bold flex items-center justify-center gap-4 transition-colors ${
            (!rating && !emoji) || saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
          }`}
        >
          <CheckCircle size={40} />
          {saving ? 'Saving...' : 'Done'}
        </button>
      </div>
    </div>
  );
};

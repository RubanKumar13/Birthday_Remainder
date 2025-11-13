import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { Member } from '../utils/db';

interface MemberFormProps {
  member?: Member;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const [name, setName] = useState(member?.name || '');
  const [birthday, setBirthday] = useState(member?.birthday || '');
  const [photo, setPhoto] = useState(member?.photo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !birthday) return;

    const newMember: Member = {
      id: member?.id || `member-${Date.now()}`,
      name,
      birthday,
      photo,
    };

    onSave(newMember);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-pink-400 to-yellow-400 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200 border-4 border-gray-200 shadow-lg">
                {photo ? (
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-3">Click to upload photo</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Birthday Date *
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors duration-200"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              {member ? 'Update' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

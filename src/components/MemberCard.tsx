import { Cake, Edit, Trash2 } from 'lucide-react';
import { Member } from '../utils/db';
import { getDaysUntilBirthday } from '../utils/notifications';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export default function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const daysUntil = getDaysUntilBirthday(member.birthday);
  const birthDate = new Date(member.birthday);
  const formattedDate = birthDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getBirthdayLabel = () => {
    if (daysUntil === 0) return "Today! 🎉";
    if (daysUntil === 1) return "Tomorrow! 🎂";
    return `In ${daysUntil} days`;
  };

  const getCardColor = () => {
    if (daysUntil === 0) return 'bg-gradient-to-br from-pink-200 to-pink-300';
    if (daysUntil === 1) return 'bg-gradient-to-br from-yellow-200 to-yellow-300';
    if (daysUntil <= 7) return 'bg-gradient-to-br from-blue-200 to-blue-300';
    return 'bg-gradient-to-br from-purple-100 to-pink-100';
  };

  return (
    <div className={`${getCardColor()} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md border-4 border-white">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
                  <span className="text-white text-2xl font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
              {member.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Cake className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="inline-block px-3 py-1 bg-white bg-opacity-70 rounded-full">
              <span className="text-sm font-semibold text-gray-800">
                {getBirthdayLabel()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(member)}
            className="flex-1 flex items-center justify-center gap-2 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: `You said: ${input}` }]);
      }, 1000);
      setInput('');
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 focus:outline-none"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftIcon className="w-6 h-6" />
        )}
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 z-50 w-full max-w-sm bg-white shadow-lg rounded-lg">
          <div className="p-4 bg-indigo-600 text-white font-semibold flex justify-between items-center">
            <span>Chatbot</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-indigo-100 text-indigo-800 self-end'
                    : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center p-4 border-t border-gray-300 mt-48">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

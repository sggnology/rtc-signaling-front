import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">WebRTC 1:1 화상 통화</h1>
      <button
        onClick={() => navigate("/call")}
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        화상 통화 시작
      </button>
    </div>
  );
};

export default Home;

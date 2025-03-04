// Room.js
import React from 'react';
import { useParams } from 'react-router-dom';

function Room() {
  const { id } = useParams();
  return (
    <div>
      <h2>Room {id}</h2>
      {/* Add room features here */}
    </div>
  );
}

export default Room;


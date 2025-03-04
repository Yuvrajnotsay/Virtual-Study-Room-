// Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const rooms = [
    { id: 1, name: 'Math Study Room' },
    { id: 2, name: 'Science Study Room' },
    { id: 3, name: 'History Study Room' },
  ];

  return (
    <div className="row">
      {rooms.map(room => (
        <div key={room.id} className="col-md-4">
          <div className="card room-card">
            <div className="card-body">
              <h5 className="card-title">{room.name}</h5>
              <Link to={`/room/${room.id}`} className="btn btn-primary">Join Room</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;


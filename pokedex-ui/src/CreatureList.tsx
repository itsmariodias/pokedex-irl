import React, { useEffect, useState } from 'react';

// Define the Creature type based on your FastAPI CreaturePublic schema
export interface Creature {
  id: number;
  name: string;
  scientific_name: string;
  description: string;
  gender_ratio: number;
  kingdom: string;
  classification: string;
  family: string;
  height: number;
  weight: number;
  body_shape: string;
  image_path: string;
}

const API_URL = 'http://localhost:8000/api/v1/creature/'; // Adjust if your FastAPI endpoint differs

const CreatureList: React.FC = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch creatures');
        return res.json();
      })
      .then((data) => {
        setCreatures(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading creatures...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Creatures</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {creatures.map((creature) => (
          <li key={creature.id} style={{ marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
            <h3>{creature.name} <small>({creature.scientific_name})</small></h3>
            <img src={creature.image_path} alt={creature.name} style={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain' }} />
            <p>{creature.description}</p>
            <div><b>Classification:</b> {creature.classification}</div>
            <div><b>Family:</b> {creature.family}</div>
            <div><b>Kingdom:</b> {creature.kingdom}</div>
            <div><b>Gender Ratio:</b> {creature.gender_ratio}</div>
            <div><b>Height:</b> {creature.height} m</div>
            <div><b>Weight:</b> {creature.weight} kg</div>
            <div><b>Body Shape:</b> {creature.body_shape}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreatureList;

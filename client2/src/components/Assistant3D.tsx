import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Model from './Model';

interface Assistant3DProps {
  isRecording: boolean;
  isConfused: boolean;
  isTalking: boolean;
    isReacting: boolean;
  reactionType: 'approval' | 'shoulders' | null;
}

const Assistant3D: React.FC<Assistant3DProps> = ({ isRecording, isConfused, isTalking, isReacting, reactionType}) => {
  const [showConfused, setShowConfused] = useState(false);

  // Trigger confused animation for exactly 3 seconds
  useEffect(() => {
    if (isConfused) {
      setShowConfused(true);
      const timer = setTimeout(() => setShowConfused(false), 3000);
      return () => clearTimeout(timer);
    } else {
      // Immediately reset if isConfused becomes false
      setShowConfused(false);
    }
  }, [isConfused]);

  // Priority: Confused > Reacting > Talking > Recording > Waiting
  const showConfusedModel = showConfused;
  const showReactingModel = !showConfused && isReacting;
  const showTalkingModel = !showConfused && !isReacting && isTalking;
  const showRecordingModel = !showConfused && !isReacting && !isTalking && isRecording;
  const showWaiting = !showConfused && !isReacting && !isTalking && !isRecording;

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[0, 1.5, 4]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />

      {/* Render only the highest-priority model (mount only when visible) */}
      {showWaiting && <Model url="/waiting6.glb" visible={true} loop />}
      {showRecordingModel && <Model url="/listening.glb" visible={true} loop />}
      {showReactingModel && reactionType === 'approval' && <Model url="/approval.glb" visible={true} loop={false} />}
      {showReactingModel && reactionType === 'shoulders' && <Model url="/shoulders.glb" visible={true} loop={false} />}
      {showTalkingModel && <Model url="/talking.glb" visible={true} loop />}
      {showConfusedModel && <Model url="/shoulders.glb" visible={true} loop={false} />}

      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default Assistant3D;
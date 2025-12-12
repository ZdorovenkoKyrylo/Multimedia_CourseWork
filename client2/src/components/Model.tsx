import React, { useRef, useEffect } from 'react';
import { Group } from 'three';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

interface ModelProps {
  url: string;
  visible?: boolean;
  loop?: boolean; // for waiting/confused animations
}

const Model: React.FC<ModelProps> = ({ url, visible = true, loop = false }) => {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url) as any;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
  if (!actions) return;

  // Stop all previous actions
  Object.values(actions).forEach((action: any) => action.stop());

  const firstAnim = Object.values(actions)[0];
  if (firstAnim && visible) {
    firstAnim.reset().fadeIn(0.2).play();
    if (loop) {
      firstAnim.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      firstAnim.setLoop(THREE.LoopOnce, 1);
      firstAnim.clampWhenFinished = true; // 👈 hold last frame until hidden
    }
  }
}, [actions, url, loop, visible]);

  return (
    <primitive
      ref={group}
      object={scene}
      scale={0.8}
      position={[0, -1.5, 0]}
      visible={visible}
    />
  );
};

export default Model;
import React, { useRef } from 'react';
import { assistantAPI } from '../services/api';

interface Props {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onAssistantResult?: (result: { text: string; response: any }) => void;
}



const AssistantAudioRecorder: React.FC<Props> = ({ isRecording, onRecordingChange, onAssistantResult }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendAudioToServer = async (audioBlob: Blob) => {
    await assistantAPI.sendAudio(audioBlob, onAssistantResult);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      onRecordingChange(true);
    } else {
      mediaRecorderRef.current?.stop();
      onRecordingChange(false);
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendAudioToServer(audioBlob);
      };
    }
  };

  return (
    <button onClick={toggleRecording}>
      {isRecording ? 'Stop & Send 🎤' : 'Record Voice 🎙️'}
    </button>
  );
};

export default AssistantAudioRecorder;

/**
 * Audio Waveform Visualizer & Live Mic Streamer
 * Simulates real-time voice ingestion and animated audio canvas spectrum
 */

class AudioWaveformVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.isRecording = false;
    this.animationId = null;
    this.bars = 36;
  }

  startSimulation(onTranscriptChunk) {
    if (!this.canvas || !this.ctx) return;
    this.isRecording = true;
    
    const phrases = [
      "Elena: Let's discuss the Redis caching layer for the billing endpoints.",
      "Arun: The latency dropped from 180ms to 24ms in staging tests.",
      "Sarah: That meets our SLA criteria. Decision approved: Deploy Redis cache.",
      "Dev: QA will benchmark it under 5,000 concurrent RPS tomorrow morning."
    ];
    
    let phraseIdx = 0;
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }
      if (phraseIdx < phrases.length) {
        if (onTranscriptChunk) onTranscriptChunk(phrases[phraseIdx]);
        phraseIdx++;
      } else {
        this.stopSimulation();
      }
    }, 2500);

    this.draw();
  }

  stopSimulation() {
    this.isRecording = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  draw() {
    if (!this.isRecording || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const width = this.canvas.width;
    const height = this.canvas.height;
    const barWidth = width / this.bars;

    for (let i = 0; i < this.bars; i++) {
      const barHeight = Math.random() * (height - 8) + 6;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const gradient = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#06B6D4');
      gradient.addColorStop(1, '#8B5CF6');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 3);
      this.ctx.fill();
    }

    this.animationId = setTimeout(() => requestAnimationFrame(() => this.draw()), 80);
  }
}

window.AudioWaveformVisualizer = AudioWaveformVisualizer;

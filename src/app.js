console.log("Hello Blackdesire");

const WIDTH = document.body.clientWidth;
const HEIGHT = document.body.clientHeight;
console.log(WIDTH, HEIGHT);

const canvas = document.getElementById("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const canvasCtx = canvas.getContext("2d");

const context = new (window.AudioContext || window.webkitAudioContext)();
const analyser = context.createAnalyser();
const constraints = { audio: true, video: false };

analyser.fftSize = 2048;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

function setFFTSize(size) {
  analyser.fftSize = size;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function drawBarSpectrum() {
  setFFTSize(256);

  const drawVisual = requestAnimationFrame(drawBarSpectrum);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = "rgb(0, 0, 0)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  const barWidth = (WIDTH / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2;

    canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
    canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

    x += barWidth + 1;
  }
}

function drawWaveSpectrum() {
  setFFTSize(2048);

  const drawVisual = requestAnimationFrame(drawWaveSpectrum);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = "rgb(0, 0, 0)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 3;
  canvasCtx.strokeStyle = "rgb(200, 200, 0)";
  canvasCtx.beginPath();

  const sliceWidth = (WIDTH * 1.0) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * HEIGHT) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

function drawTest1() {
  setFFTSize(256);

  const drawVisual = requestAnimationFrame(drawTest);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = "rgb(0, 0, 0)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.beginPath();
  canvasCtx.arc(WIDTH / 2, HEIGHT / 2, dataArray[0] + 100, 0, 2 * Math.PI);
  canvasCtx.fillStyle = "green";
  canvasCtx.fill();

  canvasCtx.beginPath();
  canvasCtx.arc(
    WIDTH / 2,
    HEIGHT / 2,
    dataArray[dataArray.length / 2] + 20,
    0,
    2 * Math.PI
  );
  canvasCtx.fillStyle = "red";
  canvasCtx.fill();
}

function drawTest2() {
  setFFTSize(256);

  const drawVisual = requestAnimationFrame(drawTest2);
  analyser.getByteFrequencyData(dataArray);

  const colBg = "rgba(0, 0, 0, 0.15)";
  const colBar0 = "rgba(255, 255, 255, 0.04)";
  const colBar1 = "rgba(255, 255, 255, 0.5)";
  const colBar2 = "rgba(255, 120, 20, 0.8)";

  const fftSz = 1024;
  const barWidth = 2;
  const barLength = 0.25;
  const bassFactor = 1.2;

  let threshold = 0;
  let width = window.innerWidth;
  let height = window.height;
  let dtRot = ((360 / dataArray.length) * 2 * Math.PI) / 180;
  let bass = Math.floor(dataArray[1]);
  let radius = -(width * barLength + bass * bassFactor);

  canvasCtx.fillStyle = colBg;
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.save();
  canvasCtx.scale(0.5, 0.5);
  canvasCtx.translate(window.innerWidth, window.innerHeight);

  function draw(rad, wdt, mlt, rot) {
    for (let i = 0; i < dataArray.length; ++i) {
      let smp = dataArray[i];
      if (smp >= threshold) {
        canvasCtx.fillRect(0, rad, wdt, -smp * mlt);
        canvasCtx.rotate(rot);
      }
    }
  }
  canvasCtx.fillStyle = colBar0;
  draw(radius, barWidth, 1.0, dtRot);
  draw(radius, barWidth, 1.0, -dtRot);
  canvasCtx.fillStyle = colBar1;
  draw(radius, barWidth, 0.5, dtRot);
  draw(radius, barWidth, 0.5, -dtRot);
  canvasCtx.fillStyle = colBar2;
  draw(radius, barWidth, 0.05, dtRot);
  draw(radius, barWidth, 0.05, -dtRot);
  canvasCtx.restore();
}

async function startMediaAnalyze(constraints) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    let source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    drawTest2();
  } catch (err) {
    console.error(err);
  }
}

startMediaAnalyze(constraints);

/*
The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Usage:
audioNode = createAudioMeter(audioContext,clipLevel,averaging,clipLag);
audioContext: the AudioContext you're using.
clipLevel: the level (0 to 1) that you would consider "clipping".
   Defaults to 0.98.
averaging: how "smoothed" you would like the meter to be over time.
   Should be between 0 and less than 1.  Defaults to 0.95.
clipLag: how long you would like the "clipping" indicator to show
   after clipping has occured, in milliseconds.  Defaults to 750ms.
Access the clipping through node.checkClipping(); use node.shutdown to get rid of it.
*/

let audioContext = null;
export let meter = null;
export let loudEnough = false;

export let tracks = null

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
  let processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;
  processor.connect(audioContext.destination);

  processor.checkClipping =
  function(){
    if (!this.clipping)
    return false;
    if ((this.lastClip + this.clipLag) < window.performance.now())
    this.clipping = false;
    return this.clipping;
  };

  processor.shutdown =
  function(){
    this.disconnect();
    this.onaudioprocess = null;
  };

  return processor;
}

function volumeAudioProcess( event ) {
  let buf = event.inputBuffer.getChannelData(0);
  let bufLength = buf.length;
  let sum = 0;
  let x;

  for (let i=0; i<bufLength; i++) {
    x = buf[i];
    if (Math.abs(x)>=this.clipLevel) {
      this.clipping = true;
      this.lastClip = window.performance.now();
    }
    sum += x * x;
  }

  let rms =  Math.sqrt(sum / bufLength);
  this.volume = Math.max(rms, this.volume*this.averaging);
}

function onMicrophoneDenied() {
    alert('Unable to use microphone. Please check your browser.');
}

let mediaStreamSource = null;

function onMicrophoneGranted(stream, loudness) {
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    tracks = mediaStreamSource.mediaStream.getTracks()
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);
    setInterval(() => {
      if (meter.volume > loudness) {
        loudEnough = true
      } else {
        loudEnough = false
      }
    }, 1)
}

export function microphoneRunner(loudness) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    try {
        navigator.getUserMedia =
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, (stream) => onMicrophoneGranted(stream, loudness), onMicrophoneDenied);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

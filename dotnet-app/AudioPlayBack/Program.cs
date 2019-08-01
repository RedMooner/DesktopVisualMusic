using System;
using System.Threading;
using NAudio.Wave;
using NAudio.Wave.SampleProviders;

namespace AudioPlayBack
{
    class Program
    {
        static void Main(string[] args)
        {
            var capture = new WasapiLoopbackCapture();
            var sampleAggregator = new SampleAggregator(512);
            sampleAggregator.PerformFFT = true;

            //var infoSended = false;
            capture.DataAvailable += (s, e) =>
            {
                byte[] buffer = e.Buffer;
                int bytesRecorded = e.BytesRecorded;
                int bufferIncrement = capture.WaveFormat.BlockAlign;

                for (int index = 0; index < bytesRecorded; index += bufferIncrement)
                {
                    float sample32 = BitConverter.ToSingle(buffer, index);
                    sampleAggregator.Add(sample32);
                }

            };
            var oldNot0 = false;
            sampleAggregator.FftCalculated += (o, e) => {
                bool not0 = false;
                for (var i = 0; i < e.Result.Length / 2; i++)
                {
                    var c = e.Result[i];
                    float amplitude = (float)Math.Sqrt(c.X * c.X + c.Y * c.Y);
                    if ((int)(amplitude * 10000) > 20) {
                        not0 = true;
                        break;
                    }
                }
                if (not0)
                {
                    for (var i = 0; i < e.Result.Length / 2; i++)
                    {
                        var c = e.Result[i];
                        float amplitude = (float)Math.Sqrt(c.X * c.X + c.Y * c.Y);
                        //Console.Write(c.X + ":"+c.Y + " ");
                        Console.Write((int)(amplitude * 100000000) + ",");
                    }
                    Console.Write("\n");
                }
                else if(oldNot0)
                {
                    Console.WriteLine("\n\n");
                }
                oldNot0 = not0;
                //if (!infoSended)
                //{
                //    Console.WriteLine(capture.WaveFormat.AverageBytesPerSecond);
                //    infoSended = true;
                //}

                //int p = e.BytesRecorded / 2 / 32;

                //for (int i = 0; i < e.BytesRecorded; i += p)
                //{
                //    Console.Write("{0},", e.Buffer[i]);
                //}
                //if (e.BytesRecorded > 0)
                //{
                //    Console.Write("\n");
                //}
            };

            capture.RecordingStopped += (s, a) =>
            {
                capture.Dispose();
            };

            capture.StartRecording();
            while (capture.CaptureState != NAudio.CoreAudioApi.CaptureState.Stopped)
            {
                Thread.Sleep(500);
            }
        }
    }
}

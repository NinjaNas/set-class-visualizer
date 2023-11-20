# set-classes-visualizer
![image](https://github.com/NinjaNas/set-class-visualizer/assets/54213302/bddd8098-7bb7-47b3-a5cf-040028b15576)

This set theory app that displays data from [ForteAPI](https://github.com/NinjaNas/ForteAPI) into a D3Dag that can be used to experiment with sounds and create play-along tracks.

## How To Use The App

### Graph
* Buttons to adjust zoom, transposition, and octaves for the graph are on the top left
* Zooming is also available using mouse wheel
* Hovering on a graph node will highlight its children
* Click on a graph node to audiate the selected set, to open a panel showing the properties of the set, and limit notes not in the set on the piano.

### Piano
* Button on bottom left opens the horizontal menu containing the piano, program, and options tabs
* Octaves on the are controlled by 1,2,3,4,5,6,7,8,9,0,- keys
* You can also shift up one octave using spacebar and down one octave using caps lock
* Click on the audio panel buttons to playback any midi file and program

### Program
* This contains a midi player and parser that parses forte numbers using inversion notation to limit notes at a certain timestamp. By loading a midi file, you can use forte numbers create a program that realizes the chord changes.
* Click the Set @ Time button is a shorthand to append the current selected set, current selected transposition, current selected timestamp in the midi file to the program body
* Click the Parse Program button to verify and load the program to be played back

### Options
* Many options change the graph in various ways such as graph type and graph text
* Some options improve the performance of the program playback for slower devices
* There is MIDI support so you can connect a MIDI controller to play

## Technologies Used
* Vue + TS
* D3
* D3Dag
* JZZ
  * Standard MIDI Files
  * Synth Tiny
  * Input Keyboard





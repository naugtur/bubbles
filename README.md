# bubbles

> A collection of tiny tools that run things in Docker for my personal use.


- [bubble](#bubble) - Open current folder in a container
- [speechbubble](#speechbubble) - Voice keyboard

--- 

## bubble

A quick way to open the current folder in a container (based on Node.js LTS official image) 

```
Usage: bubble [OPTIONS]

Options:
  --offline   Run container without network access
  --rebuild [packages]    Rebuild the docker image with added packages
  --help      Show this help message
```

Example: rebuild the image used with added packages for python
```
bubble --rebuild python3 python3-pip python3.11-venv
```

TODO: 
 - preserve bash history inside the bubble

---

## speechbubble

A command line tool for quick voice-to-text transcription using whisper.cpp. 
Perfect for hands-free dictation through a keyboard shortcut.

### Usage

Press your configured keyboard shortcut to:
1. First press: Start recording
2. Second press: Stop recording, transcribe audio and type out the result

### Setup

1. Install xdotool:
```bash
sudo apt-get install xdotool
brew install xdotool
```

2. Set up a keyboard shortcut in your desktop environment
   - Open your system's keyboard settings
   - Add a new shortcut
   - Set the command to: `speechbubble`
   - Choose a convenient key combination

3. First run will download the whisper model and dependencies

### Configuration

Edit these variables at the top of the script:
- `AUDIO_INPUT` - audio input device (use `arecord -l` to list devices)
- `MAX_DURATION` - maximum recording duration in seconds
- `MODEL_NAME` - whisper model to use (default: base.en)

TODO:
 - speed it up by using mono sound maybe
 - externalize hardware configuration
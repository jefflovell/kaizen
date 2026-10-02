# Signal Bloom feature roadmap

Status: Planned. These releases describe proposed work, not shipped features. Relative difficulty is an engineering estimate, not a delivery commitment.

Signal Bloom currently plays a fixed set of sounds and drives visuals from audio analysis. Recording, a shared musical clock, editable pads, and project storage are new foundations. Preserve the sound-reactive visuals and immediate play experience; place production controls in an expandable studio panel.

## Release 1 — Record and layer beats

Covers priorities 1–4. The first complete workflow: play a beat, loop it, add layers, tighten timing, and download the result.

- **Recording and layering — High:** Record pad performances into 1-, 2-, 4-, or 8-bar loops; overdub additional layers; mute, delete, and undo the latest layer.
- **Metronome — Low once the clock exists:** BPM control, audible click, visual beat indicator, and an optional one-bar count-in.
- **Quantization — Medium:** Snap recorded hits to 1/8- or 1/16-note timing; support Off; preserve original timing so changes are reversible.
- **Download — Medium:** Export the mixed loop as a stereo WAV, excluding the metronome.

Record which pads were played and when instead of immediately flattening everything into audio. This allows timing edits, separate layers, and later sound replacement. Use one shared audio clock for playback, recording, and the metronome. Keep live pad feedback immediate; apply quantization to recorded playback.

**Ready when:** A user can record a four-bar beat, add two layers, undo one, change quantization, and download a WAV that matches playback and loops cleanly.

## Release 2 — Shape sounds and build kits

Covers priorities 5, 6, and 10. Introduce editable pads before adding a large collection of sounds.

- **Parametric EQ — Medium:** Three adjustable bands with frequency, gain, and bandwidth controls; bypass and reset; master EQ first.
- **Sample libraries — Medium:** A small curated set of free drum and effects packs, with preview, loading feedback, and source/license credits. Verify each pack permits the intended use and redistribution.
- **Custom pads and patches — Medium–high:** Assign sounds to pads; edit names, volume, pitch, and playback behavior; save and reload kits.

A pad holds a sound and its settings. A kit/patch saves a collection of pad assignments and settings. Keep those separate from the recorded performance. Start with a few cohesive libraries instead of a searchable marketplace. Changing a kit should be explicit because it can change an existing performance.

Add local project saving and a portable project backup here. WAV downloads preserve the finished sound; project backups preserve editable work.

**Ready when:** A user can choose a drum kit, customize several pads, adjust EQ, save the project, and reopen it with the same sounds and settings.

## Release 3 — Import, slice, and remix

Covers priorities 7 and 9. An imported song becomes much more useful when excerpts can become playable pads.

- **Song/audio import — Medium:** Load a local audio file, display its waveform, preview it, and control its level.
- **Clipping and windowing — Medium–high:** Select start/end points, zoom, audition the selection, add short fades, and assign the clip to a pad.
- **Remix playback — High:** Start an imported backing track with the loop transport; set its start offset and manually enter its BPM.

Treat windowing initially as selecting a playable region with fades to reduce clicks at its boundaries. Editing preserves the original file. Import files locally in the browser, with file-size guidance and clear errors for unsupported formats.

Automatic beat detection, tempo matching without changing pitch, and time stretching are separate enhancements. Importing a song does not make it follow the project tempo.

**Ready when:** A user can import a track, extract several clips, assign them to pads, record a new arrangement, and export it.

## Release 4 — Frequency isolation and stem separation

Covers priority 8, split into two distinct capabilities.

- **Frequency isolation — Low–medium:** Audition or export a selected frequency range using high-pass and low-pass filters. This can ship alongside EQ or the clip editor.
- **Vocal/instrument separation — Very high:** Generate separate vocal, drum, bass, and accompaniment tracks with a source-separation model.

Frequency isolation can emphasize bass, brightness, or a narrow band, but cannot reliably extract vocals or an instrument because their frequencies overlap.

Actual stem separation needs a feasibility stage covering processing location, model licensing, hardware requirements, processing time, and audible artifacts. Begin with an import-stems workflow so users can remix previously separated tracks. Add built-in separation after evaluating a model and deciding whether processing runs on the device or a server.

**Ready when:** Frequency filtering is clearly distinguished from stem separation, and any separation workflow produces independently controllable tracks that can be clipped and assigned to pads.

## Foundations and implementation order

1. Shared musical clock and precisely scheduled sample playback.
2. Recording data model, layers, and reversible timing edits.
3. Offline audio rendering and WAV export.
4. Editable sample/pad model and project persistence.
5. EQ and curated sample packs.
6. Audio import, waveform editing, and clip-to-pad assignment.
7. Frequency filtering.
8. Stem-separation feasibility work and integration.

The first release stays focused on record → layer → quantize → download. It delivers a useful instrument while establishing the timing and export foundations needed by everything that follows.

## Original feature priorities

1. Recording to layer beats — Release 1.
2. Metronome — Release 1.
3. Quantizer — Release 1.
4. Sample/mix download — Release 1.
5. Parametric EQ — Release 2.
6. Different free sample libraries — Release 2.
7. Song import for remixing — Release 3.
8. Frequency or vocal/instrument isolation — Release 4, with frequency filtering eligible earlier.
9. Clipping/windowing to create samples — Release 3.
10. Custom sample pads/patches — Release 2, moved earlier to support libraries and imported clips.

## Technical references

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API): browser audio processing, filters, and offline rendering.
- [Freesound licensing FAQ](https://freesound.org/help/faq/): sample licenses and attribution requirements.
- [Demucs](https://github.com/facebookresearch/demucs): an example of model-based music source separation; evaluate suitability before adoption.

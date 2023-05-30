# cps-cli
A nodejs version of https://media.smwcentral.net/Alcaro/bps/
It's used to apply .bps patches to ROM files.

## Usage

```bash
$ cps rom-file.ext patch-file.bps
```
It will create a `patch-file-patched.ext` with the patched ROM.

You also can use it to create multi patched ROMs at the same time:

```bash
$ cps rom-file.ext patch-file.bps anotherpatch.bps anotherone.bps
```
It will create `patch-file-patched.ext` `anotherpatch-patched.ext` `anotherone-patched.ext`.

## Credits
It is a shamelees copy of https://media.smwcentral.net/Alcaro/bps/, all credits to the [original creator](https://www.smwcentral.net/?p=profile&id=1686).

## License
You may do whatever you want with this, except blame the author if anything goes wrong.

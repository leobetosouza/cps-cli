#! /usr/bin/env node

const fs = require('fs')

const sourcePath = process.argv[2]
const source = fs.readFileSync(sourcePath)
const ext = sourcePath.split('.').at(-1)

for (let i = 3, l = process.argv.length; i < l; i++) {
    const patchPath = process.argv[i]
    const patch = fs.readFileSync(patchPath)

    const file = applyBps(
        new Uint8Array(source), 
        new Uint8Array(patch)
    )

    writeFile(patchPath, ext, file)
}


function writeFile(patchPath, ext, file) {
    const fileName = patchPath.replace(/\.bps$/, '')

    try {
        fs.writeFileSync(`${fileName}-patched.${ext}`, file)
    } catch (err) {
        console.error(err)
    }
}

function applyBps(rom, patch) {
	function crc32(bytes) {
		var c;
		var crcTable = [];
		for(var n =0; n < 256; n++){
			c = n;
			for(var k =0; k < 8; k++){
				c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			crcTable[n] = c;
		}
		
		var crc = 0 ^ (-1);
		for (var i = 0; i < bytes.length; i++ ) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
		}
		return (crc ^ (-1)) >>> 0;
	};
	
	var patchpos = 0;
	function u8() { return patch[patchpos++]; }
	function u32at(pos) { return (patch[pos+0]<<0 | patch[pos+1]<<8 | patch[pos+2]<<16 | patch[pos+3]<<24)>>>0; }
	
	function decode()
	{
		var ret = 0;
		var sh = 0;
		while (true)
		{
			var next = u8();
			ret += (next^0x80) << sh;
			if (next&0x80) return ret;
			sh += 7;
		}
	}
	
	function decodes()
	{
		var enc = decode();
		var ret = enc>>1;
		if (enc&1) ret=-ret;
		return ret;
	}
	
	if (u8()!=0x42 || u8()!=0x50 || u8()!=0x53 || u8()!=0x31) throw "not a BPS patch";
	if (decode() != rom.length) throw "wrong input file";
	if (crc32(rom) != u32at(patch.length-12)) throw "wrong input file";
	
	var out = new Uint8Array(decode());
	var outpos = 0;
	
	var metalen = decode();
	patchpos += metalen; // can't join these two, JS reads patchpos before calling decode
	
	var SourceRead=0;
	var TargetRead=1;
	var SourceCopy=2;
	var TargetCopy=3;
	
	var inreadpos = 0;
	var outreadpos = 0;
	
	while (patchpos < patch.length-12)
	{
		var thisinstr = decode();
		var len = (thisinstr>>2)+1;
		var action = (thisinstr&3);
		
		switch (action)
		{
			case SourceRead:
			{
				for (var i=0;i<len;i++)
				{
					out[outpos] = rom[outpos];
					outpos++;
				}
			}
			break;
			case TargetRead:
			{
				for (var i=0;i<len;i++)
				{
					out[outpos++] = u8();
				}
			}
			break;
			case SourceCopy:
			{
				inreadpos += decodes();
				for (var i=0;i<len;i++) out[outpos++] = rom[inreadpos++];
			}
			break;
			case TargetCopy:
			{
				outreadpos += decodes();
				for (var i=0;i<len;i++) out[outpos++] = out[outreadpos++];
			}
			break;
		}
	}
	
	return out;
}
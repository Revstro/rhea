const linuxLines = [`Type \`rm -rf /\` in the terminal for extra hard drive space`,
			`People with 200 IQ use Gentoo with dwm and watch Mental Outlaw`,
			`People with 150 IQ use Arch Linux and watch Luke Smith`,
			`systemd is bloat`,
			`sudo is bloat`,
			`Open a terminal on your friend's Ubuntu laptop and try this: \`:(){ :|: & };;\``,
			`Normies ues Manjaro`,
			`Nano is for losers, use Vim instead`];

this.linuxAdvice = function() {
	let rndm = (linuxLines.length - 1) * Math.random();
	rndm = Math.round(rndm);

	return linuxLines[rndm];
}

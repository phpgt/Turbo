<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<style>
		html, body {
			height: 100%;
		}
		body {
			display: flex;
			justify-content: stretch;
			flex-direction: column;
			margin: 0;
		}
		nav {
			margin: 0.5rem;

			ul {
				display: flex;
				flex-wrap: wrap;
				gap: 1rem;
				list-style-type: none;
				padding: 0;

				>li {
					text-align: center;

					a {
						display: block;
						padding: 0.5rem;
					}
				}
			}
		}
		main {
			margin: 1rem;
			max-width: 48rem;
		}
		textarea {
			margin: 1rem;
			max-width: 48rem;
		}
	</style>
	<script type="module" src="../dist/turbo.js" defer></script>
</head>
<body>
<nav>
	<ul>
		<?php
		echo "<li><a href='index.php'>index.php</a></li>";
		chdir(__DIR__);
		foreach(glob("*.php") as $file) {
			if($file === "index.php" || $file[0] === "_") {
				continue;
			}

			echo "<li><a href='$file'>$file</a></li>";
		}
		?>
	</ul>
</nav>

<textarea placeholder="Without Turbo, submitting the form or clicking a link would lose any content typed into this box.">
</textarea>

<main>

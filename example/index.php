<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<title>PHP.GT Turbo Examples</title>
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
		iframe {
			flex-grow: 1;
			border: none;
		}
		nav {
			ul {
				display: flex;
				gap: 1rem;
				list-style-type: none;
			}
		}
	</style>
</head>
<body>
	<nav>
		<ul>
			<?php
			chdir(__DIR__);
			foreach(glob("*.php") as $file) {
				if($file === "index.php") {
					continue;
				}

				echo "<li><a href='$file' target='frame'>$file</a></li>";
			}
			?>
		</ul>
	</nav>
	<iframe name="frame"></iframe>
</body>
</html>

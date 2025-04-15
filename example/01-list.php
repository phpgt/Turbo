<?php
session_start();

$list = $_SESSION["list"] ?? [];
$doAction = $_REQUEST["do"] ?? null;

if($doAction === "add") {
	array_push($list, $_POST["new-item"]);
	$_SESSION["list"] = $list;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
elseif($doAction === "delete") {
	$index = $_REQUEST["index"] ?? 0;

	if(isset($list[$index])) {
		unset($list[$index]);
		$_SESSION["list"] = array_values($list);
		header("Location: $_SERVER[SCRIPT_NAME]");
		exit;
	}
}

?><!doctype html>
<meta charset="utf-8" />
<title>PHPGT/Turbo example 01 list</title>
<style>
textarea {
	width: 24rem;
}
</style>
<script type="module" src="../dist/turbo.js" defer></script>

<textarea placeholder="Without Turbo, submitting the form would lose any content typed into this box.">
</textarea>

<form method="post" data-turbo="update-inner">
	<ul>
		<?php
		foreach($list as $i => $item) {
			echo "<li>";
			echo "<a href='?do=delete&index=$i' data-turbo='link'>";
			echo $item;
			echo "</a>";
			echo "</li>";
		}
		?>
	</ul>

	<label>
		<span>New list item</span>
		<input name="new-item" required autofocus autocomplete="off" />
	</label>

	<button name="do" value="add" data-turbo="submit">Add</button>
</form>

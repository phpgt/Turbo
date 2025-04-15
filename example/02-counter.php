<?php
session_start();

$num = $_SESSION["num"];
$doAction = $_REQUEST["do"] ?? null;

if($doAction === "increment") {
	$num++;
	$_SESSION["num"] = $num;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
elseif($doAction === "decrement") {
	$num--;
	$_SESSION["num"] = $num;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
?><!doctype html>
<meta charset="utf-8" />
<title>PHPGT/Turbo example 02 increment</title>
<style>
textarea {
	width: 24rem;
}
</style>
<script type="module" src="../dist/turbo.js" defer></script>

<textarea placeholder="Without Turbo, submitting the form would lose any content typed into this box.">
</textarea>

<form method="post">
	<output data-turbo="update-inner"><?php echo number_format($num);?></output>
	<button name="do" value="increment" data-turbo="submit">Increment</button>
	<button name="do" value="decrement" data-turbo="submit">Decrement</button>
</form>

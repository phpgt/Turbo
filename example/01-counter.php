<?php
/**
 * This is the simplest example. Two buttons are used to increment or
 * decrement a counter, stored in the session. The output element shows
 * the value of the counter.
 */
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
require(__DIR__ . "/_header.php");
?>
<title>PHPGT/Turbo example 01 increment</title>

<form method="post">
	<output data-turbo="update-inner"><?php echo number_format($num);?></output>
	<button name="do" value="increment" data-turbo="submit">Increment</button>
	<button name="do" value="decrement" data-turbo="submit">Decrement</button>
</form>

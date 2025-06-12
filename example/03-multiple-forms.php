<?php
/**
 * This example is like 01-counter, but multiple forms are present on the
 * page that all update simultaneously. Two forms have independent counters,
 * and an <output> element shows the sum of the two counters.
 *
 * The `data-turbo` attribute is added to the containing element, which updates
 * the outerHTML of the container, but hooks into the contained forms' submit
 * events.
 */
session_start();

$numA = $_SESSION["numA"];
$numB = $_SESSION["numB"];
$sum = $numA + $numB;

$doAction = $_REQUEST["do"] ?? null;
if($doAction === "incrementA") {
	$numA++;
	$_SESSION["numA"] = $numA;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
elseif($doAction === "incrementB") {
	$numB++;
	$_SESSION["numB"] = $numB;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
elseif($doAction === "decrementA") {
	$numA--;
	$_SESSION["numA"] = $numA;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}
elseif($doAction === "decrementB") {
	$numB--;
	$_SESSION["numB"] = $numB;
	header("Location: $_SERVER[SCRIPT_NAME]");
	exit;
}

require(__DIR__ . "/_header.php");
?>
<title>PHPGT/Turbo example 03 multiple forms</title>
<section data-turbo>
	<form method="post">
		<h1>Counter A</h1>
		<output><?php echo number_format($numA);?></output>
		<button name="do" value="incrementA">Increment</button>
		<button name="do" value="decrementA">Decrement</button>
	</form>

	<form method="post">
		<h1>Counter B</h1>
		<output><?php echo number_format($numB);?></output>
		<button name="do" value="incrementB">Increment</button>
		<button name="do" value="decrementB">Decrement</button>
	</form>

	<h1>A + B =</h1>
	<output><?php echo $sum;?></output>
</section>

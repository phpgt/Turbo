<?php
require(__DIR__ . "/_header.php");
?>
<title>PHP.GT Turbo Examples</title>
<p data-turbo-debug>Turbo - choose an example from the list above.</p>
<p>This very basic website has two purposes: 1, to show simple interactive examples from the documentation; 2, to provide automated testing using Behat.</p>
<p>Every time the code is changed, GitHub Actions automatically runs the behat tests that perform actions to assure the functionality is working in a real world Firefox web browser. You can run the tests yourself by running `composer install` followed by `composer test`.</p>

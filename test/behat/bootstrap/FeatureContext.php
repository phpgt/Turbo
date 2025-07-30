<?php
namespace App\Test\Behat\Bootstrap;

use Behat\Behat\Tester\Exception\PendingException;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Behat\Hook\Scope\BeforeStepScope;
use Behat\Behat\Hook\Scope\AfterStepScope;
use Behat\Behat\Hook\Scope\BeforeFeatureScope;

class FeatureContext extends MinkContext {
	private $clientSideText = "Test context data";
	private $stepStartTime;
	private $maxStepDuration = 30; // Maximum step duration in seconds
	private $timeoutPid;

	/**
	 * @BeforeFeature
	 */
	public static function beforeFeature(BeforeFeatureScope $scope) {
		// Set PHP's default socket timeout to 10 seconds
		ini_set('default_socket_timeout', 10);
	}

	/**
	 * @BeforeScenario
	 */
	public function beforeScenario(BeforeScenarioScope $scope) {
		// Set a timeout for the entire scenario
		$this->startTimeoutProcess();

		// Explicitly set the Selenium server URL
		$this->setMinkParameter('wd_host', 'http://127.0.0.1:4444/wd/hub');

		// Print debug information
		echo "Starting scenario: " . $scope->getScenario()->getTitle() . PHP_EOL;
		echo "Selenium server URL: " . $this->getMinkParameter('wd_host') . PHP_EOL;
		echo "Browser: " . $this->getMinkParameter('browser_name') . PHP_EOL;
	}

	/**
	 * Start a background process that will kill the current PHP process if it runs for too long
	 */
	private function startTimeoutProcess() {
		// Kill any existing timeout process
		if ($this->timeoutPid) {
			exec("kill -9 {$this->timeoutPid} 2>/dev/null");
		}

		// Start a new timeout process that will kill the current process after 10 seconds
		$cmd = "php -r 'sleep(10); posix_kill(" . getmypid() . ", 9);' > /dev/null 2>&1 & echo $!";
		$this->timeoutPid = trim(shell_exec($cmd));
	}

	/**
	 * @BeforeStep
	 */
	public function beforeStep(BeforeStepScope $scope) {
		$this->stepStartTime = microtime(true);

		// Reset the timeout process for each step
		$this->startTimeoutProcess();

		// Print step information
		echo "Executing step: " . $scope->getStep()->getText() . PHP_EOL;

		// Try to initialize the session
		try {
			$session = $this->getSession();
			echo "Session object created" . PHP_EOL;

			if (!$session->isStarted()) {
				echo "Session is not started, attempting to start..." . PHP_EOL;
				$session->start();
				echo "Session started successfully" . PHP_EOL;
			} else {
				echo "Session is already started" . PHP_EOL;
			}

			// Set a timeout for the Selenium session if available
			if ($session->getDriver()) {
				echo "Driver is available" . PHP_EOL;
				try {
					// Set script timeout to 10 seconds
					$session->getDriver()->setTimeouts(['script' => 10000]);
					echo "Timeouts set successfully" . PHP_EOL;
				} catch (\Exception $e) {
					echo "Error setting timeouts: " . $e->getMessage() . PHP_EOL;
				}
			} else {
				echo "Driver is not available" . PHP_EOL;
			}
		} catch (\Exception $e) {
			echo "Error with session: " . $e->getMessage() . PHP_EOL;
		}
	}

	/**
	 * @AfterStep
	 */
	public function afterStep(AfterStepScope $scope) {
		// Kill the timeout process since the step completed in time
		if ($this->timeoutPid) {
			exec("kill -9 {$this->timeoutPid} 2>/dev/null");
			$this->timeoutPid = null;
		}

		$duration = microtime(true) - $this->stepStartTime;
		if ($duration > $this->maxStepDuration) {
			throw new \Exception(
				sprintf(
					'Step execution time (%.2f seconds) exceeded the maximum allowed time (%d seconds)',
					$duration,
					$this->maxStepDuration
				)
			);
		}
	}

	/**
	 * @Given /^I store some client side context$/
	 */
	public function iStoreSomeClientSideContext() {
		$this->getSession()->executeScript(
			"document.querySelector('textarea').value = '" . $this->clientSideText . "';"
		);
	}

	/**
	 * @Given /^I the client side context should be retained$/
	 */
	public function iTheClientSideContextShouldBeRetained() {
		$textareaValue = $this->getSession()->evaluateScript(
			"return document.querySelector('textarea').value;"
		);

		if ($textareaValue !== $this->clientSideText) {
			throw new \Exception(
				"Client side context was not retained. Expected '{$this->clientSideText}', got '{$textareaValue}'"
			);
		}
	}

	/**
	 * @Then /^the counter should show "([^"]*)"$/
	 */
	public function theCounterShouldShow($expectedValue) {
		$outputElement = $this->getSession()->getPage()->find('css', 'output');

		if (!$outputElement) {
			throw new \Exception("Output element not found");
		}

		$actualValue = $outputElement->getText();

		if ($actualValue !== $expectedValue) {
			throw new \Exception(
				"Counter shows incorrect value. Expected '{$expectedValue}', got '{$actualValue}'"
			);
		}
	}
}

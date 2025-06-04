<?php
use Behat\Behat\Tester\Exception\PendingException;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;

class FeatureContext extends MinkContext {
	private $clientSideText = "Test context data";

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

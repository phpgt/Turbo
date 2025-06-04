Feature: Example

	Scenario: I see something
		Given I am on "/example/01-counter.php"
		And I store some client side context
		Then the counter should show "0"
		When I press "Increment"
		Then the counter should show "1"
		When I press "Increment"
		Then the counter should show "2"
		And I the client side context should be retained


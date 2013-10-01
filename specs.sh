#!/usr/bin/env bash

GLOBIGNORE="spec/test_iit_spec.js"

entry="node lib/cli.js"

echo "All these tests should pass"
command="${entry} spec/*_spec.js"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 54, 100 assertions, 0 failures. ---\033[0m"
echo ""

echo "These should be examples of failing tests"
command="${entry} spec/failure_egs.js spec/syntax_error.js"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 6 tests, 6 assertions, 5 failures ---\033[0m"
echo ""

echo "iit tests"
command="${entry} spec/test_iit_spec.js"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 2 tests, 2 assertions, 0 failures ---\033[0m"
echo ""

#!/usr/bin/env bash

entry="node lib/cli.js"

echo "All these tests should pass"
command="${entry} spec/*_spec.js"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 11 specs, 0 failures. ---\033[0m"
echo ""

echo "These should be examples of failing tests"
command="${entry} spec/failure_egs.js spec/syntax_error.js"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 4 specs, 3 failures ---\033[0m"
echo ""

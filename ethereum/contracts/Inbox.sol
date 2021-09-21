// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.4.17;

contract Inbox {
    string public message;

    function Inbox(string memory initialMessage) public {
        message = initialMessage;
    }

    function setMessage(string memory _message) public {
        message = _message;
    }
}

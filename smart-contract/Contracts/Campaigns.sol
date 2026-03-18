// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampaignFactory {
    address[] public deployedCampaigns;

    event CampaignCreated(address indexed campaignAddress, address indexed manager);

    function createCampaign(
        uint256 minimum,
        string memory name,
        string memory description,
        string memory image,
        uint256 target
    ) public {
        address newCampaign = address(
            new Campaign(minimum, msg.sender, name, description, image, target)
        );
        deployedCampaigns.push(newCampaign);
        emit CampaignCreated(newCampaign, msg.sender);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint256 public minimunContribution;
    string public CampaignName;
    string public CampaignDescription;
    string public imageUrl;
    uint256 public targetToAchieve;
    mapping(address => bool) public approvers;
    uint256 public approversCount;

    modifier restricted() {
        require(msg.sender == manager, "Only the campaign manager can call this function.");
        _;
    }

    constructor(
        uint256 minimun,
        address creator,
        string memory name,
        string memory description,
        string memory image,
        uint256 target
    ) {
        manager = creator;
        minimunContribution = minimun;
        CampaignName = name;
        CampaignDescription = description;
        imageUrl = image;
        targetToAchieve = target;
    }

    function contibute() public payable {
        require(msg.value >= minimunContribution, "Contribution is below the minimum amount.");

        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

    function createRequest(
        string memory description,
        uint256 value,
        address payable recipient
    ) public restricted {
        require(value > 0, "Request amount must be greater than zero.");
        require(recipient != address(0), "Recipient address is invalid.");

        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint256 index) public {
        require(approvers[msg.sender], "Only contributors can approve requests.");
        require(!requests[index].approvals[msg.sender], "Request already approved.");
        require(!requests[index].complete, "Cannot approve a completed request.");

        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2), "Not enough approvals to finalize the request.");
        require(!request.complete, "Request already finalized.");
        require(address(this).balance >= request.value, "Campaign balance is too low to finalize the request.");

        request.complete = true;
        request.recipient.transfer(request.value);
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            minimunContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            targetToAchieve
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}

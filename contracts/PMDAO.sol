// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Project and User Management Contract
/// @notice This contract facilitates user and project management.
/// @dev All functions are implemented without side effects.
contract PMDAO {

    struct User {
        string name;
        string role;
    }

    struct Task {
        string name;
        string status;
    }

    struct Milestone {
        string name;
        string status;
    }

    struct Project {
        string name;
        Task[] tasks;
        Milestone[] milestones;
    }

    mapping(address => User) public users;
    mapping(bytes32 => Project) public projects;
    mapping(address => bool) public admins;

    /// @dev Emitted when a new user is added.
    event UserAdded(address indexed _user, string _name, string _role);
    
    /// @dev Emitted when a new project is added.
    event ProjectAdded(bytes32 indexed _projectId, string _projectName);

    /// @dev Emitted when a new task is added to a project.
    event TaskAdded(bytes32 indexed _projectId, string _taskName, string _taskStatus);

    /// @dev Emitted when a new milestone is added to a project.
    event MilestoneAdded(bytes32 indexed _projectId, string _milestoneName, string _milestoneStatus);

    /// @dev Emitted when a new admin is added.
    event AdminAdded(address indexed _admin, bool _status);

    /// @notice Ensures that only admin can perform certain actions
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }

    /// @notice Initializes the contract and sets `msg.sender` as an admin
    constructor() {
        admins[msg.sender] = true;
    }

    /// @notice Adds a new user
    /// @param _user The address of the user
    /// @param _name The name of the user
    /// @param _role The role of the user
    function addUser(address _user, string memory _name, string memory _role) public onlyAdmin {
        User storage user = users[_user];
        user.name = _name;
        user.role = _role;
        emit UserAdded(_user, _name, _role);
    }

    /// @notice Adds a new project
    /// @param _id The ID of the project
    /// @param _name The name of the project
    function addProject(bytes32 _id, string memory _name) public onlyAdmin {
        Project storage project = projects[_id];
        project.name = _name;
        emit ProjectAdded(_id, _name);
    }

    /// @notice Adds a task to a project
    /// @param _projectId The ID of the project
    /// @param _name The name of the task
    /// @param _status The status of the task
    function addTask(bytes32 _projectId, string memory _name, string memory _status) public onlyAdmin {
        Task memory newTask = Task(_name, _status);
        projects[_projectId].tasks.push(newTask);
        emit TaskAdded(_projectId, _name, _status);
    }

    /// @notice Adds a milestone to a project
    /// @param _projectId The ID of the project
    /// @param _name The name of the milestone
    /// @param _status The status of the milestone
    function addMilestone(bytes32 _projectId, string memory _name, string memory _status) public onlyAdmin {
        Milestone memory newMilestone = Milestone(_name, _status);
        projects[_projectId].milestones.push(newMilestone);
        emit MilestoneAdded(_projectId, _name, _status);
    }

    /// @notice Allows the admin to add or remove other admins
    /// @param _admin The address of the new admin
    /// @param _status The status of the admin (true for add, false for remove)
    function setAdmin(address _admin, bool _status) public onlyAdmin {
        admins[_admin] = _status;
        emit AdminAdded(_admin, _status);
    }

    /// @notice Gets the number of tasks in a project
    /// @param _projectId The ID of the project
    /// @return The number of tasks
    function getTaskCount(bytes32 _projectId) public view  returns (uint256) {
        return projects[_projectId].tasks.length;
    }

   /// @notice Retrieves a task by index from a project
    /// @param _projectId The ID of the project
    /// @param _index The index of the task in the project's task list
    /// @return name The name of the task
    /// @return status The status of the task
    function getTaskByIndex(bytes32 _projectId, uint _index) public view  returns (string memory name, string memory status) {
        Project storage project = projects[_projectId];
        require(_index < project.tasks.length, "Task index out of bounds");
        Task storage task = project.tasks[_index];
        return (task.name, task.status);
    }

    /// @notice Gets the most recently added milestone for a project
    /// @param _projectId The ID of the project
    /// @return name The name of the most recently added milestone
    /// @return status The status of the most recently added milestone
    function getLastMilestone(bytes32 _projectId) public view  returns (string memory name, string memory status) {
        Project storage project = projects[_projectId];
        require(project.milestones.length > 0, "No milestones found for this project");

        Milestone storage milestone = project.milestones[project.milestones.length - 1];
        return (milestone.name, milestone.status);
    }
}

export const updateProjectRM = asyncHandler(async (id, amount, type) => {
    const project = await Project.findOne({ _id: id });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    switch (type) {
        case "credit":
            project.allocatedFunds += amount;
            break;
        case "debit":
            project.allocatedFunds -= amount;
            break;
        default:
            throw new ApiError(400, "Invalid transaction type");
    }
    await project.save();
    return project;
})
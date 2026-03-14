export const loadMaterials = async (course, branch) => {
  try {
    // Dynamic import based on course and branch
    const module = await import(`./materials/${course}/${branch}/index.js`);
    return module.default || [];
  } catch (error) {
    console.error(`Failed to load materials for ${course}/${branch}:`, error);
    return [];
  }
};

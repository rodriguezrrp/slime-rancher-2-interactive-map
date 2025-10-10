import json
import numpy as np
import matplotlib.pyplot as plt

def quaternion_to_matrix(q):
    """Convert quaternion (x, y, z, w) to 3x3 rotation matrix."""
    x, y, z, w = q['x'], q['y'], q['z'], q['w']
    
    return np.array([
        [1 - 2*(y**2 + z**2), 2*(x*y - w*z), 2*(x*z + w*y)],
        [2*(x*y + w*z), 1 - 2*(x**2 + z**2), 2*(y*z - w*x)],
        [2*(x*z - w*y), 2*(y*z + w*x), 1 - 2*(x**2 + y**2)]
    ])

def create_transform_matrix(local_pos, local_rot, local_scale):
    """Create a 4x4 transformation matrix from local position, rotation, and scale."""
    # Create rotation matrix from quaternion
    R = quaternion_to_matrix(local_rot)
    
    # Create scale matrix
    S = np.diag([local_scale['x'], local_scale['y'], local_scale['z']])
    
    # Combine rotation and scale
    RS = R @ S
    
    # Create 4x4 transformation matrix
    T = np.eye(4)
    T[:3, :3] = RS
    T[:3, 3] = [local_pos['x'], local_pos['y'], local_pos['z']]
    
    return T

def calculate_world_position(transform_chain):
    """Calculate world position by applying transform chain from child to parent."""
    # Start with identity matrix
    world_transform = np.eye(4)
    
    # Apply transforms from child to parent (reverse order for proper matrix multiplication)
    for transform in reversed(transform_chain):
        local_pos = transform['props']['m_LocalPosition']
        local_rot = transform['props']['m_LocalRotation']
        local_scale = transform['props']['m_LocalScale']
        
        local_transform = create_transform_matrix(local_pos, local_rot, local_scale)
        world_transform = local_transform @ world_transform
    
    # Extract world position from final matrix
    world_pos = world_transform[:3, 3]
    return world_pos

def build_hierarchy_graph(data):
    """Build a graph of all transforms with their world positions and parent-child relationships."""
    transforms = {}
    edges = []
    
    for item in data:
        chain = item['transformChainChildToParent']
        
        # Process each transform in the chain
        for i, transform in enumerate(chain):
            file_id = transform['fileId']
            
            # Skip if already processed
            if file_id in transforms:
                continue
            
            # Calculate world position up to this point in chain
            chain_up_to_here = chain[i:]
            world_pos = calculate_world_position(chain_up_to_here)
            
            transforms[file_id] = {
                'world_pos': world_pos,
                'name': transform['gameObject']['props']['m_Name'],
                'file_id': file_id
            }
            
            # Add edge to parent if not root
            if i < len(chain) - 1:
                parent_id = chain[i + 1]['fileId']
                edges.append((file_id, parent_id))
    
    return transforms, edges

def visualize_transforms(transforms, edges):
    """Visualize transforms on XZ plane with parent-child connections."""
    fig, ax = plt.subplots(figsize=(14, 12))
    
    # Extract positions
    positions = {fid: (t['world_pos'][0], t['world_pos'][2]) for fid, t in transforms.items()}
    
    # Draw edges
    for child_id, parent_id in edges:
        if child_id in positions and parent_id in positions:
            child_pos = positions[child_id]
            parent_pos = positions[parent_id]
            ax.plot([child_pos[0], parent_pos[0]], 
                   [child_pos[1], parent_pos[1]], 
                   'b-', alpha=0.3, linewidth=1, zorder=1)
    
    # Draw nodes
    for fid, transform in transforms.items():
        pos = positions[fid]
        ax.plot(pos[0], pos[1], 'ro', markersize=6, zorder=2)
    
    # Draw labels separately with higher z-order and smart positioning
    label_positions = {}
    for fid, transform in transforms.items():
        pos = positions[fid]
        name = transform['name']
        
        # Find unique offset for overlapping labels
        offset_x, offset_y = 5, 5
        label_key = (round(pos[0], 2), round(pos[1], 2))
        
        if label_key in label_positions:
            # Offset subsequent labels at same position
            offset_y += 12 * label_positions[label_key]
            label_positions[label_key] += 1
        else:
            label_positions[label_key] = 1
        
        # Add label with name
        ax.annotate(name, 
                   xy=pos, 
                   xytext=(offset_x, offset_y),
                   textcoords='offset points',
                   fontsize=7,
                   alpha=0.8,
                   zorder=3)
    
    ax.set_xlabel('X Position (World)', fontsize=12)
    ax.set_ylabel('Z Position (World)', fontsize=12)
    ax.set_title('Unity Transform Hierarchy (XZ Plane View)', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.axis('equal')
    
    plt.tight_layout()
    plt.show()

# Main execution
if __name__ == "__main__":
    # Load JSON data
    with open('shdepoPositions.json', 'r') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} objects")
    
    # Build hierarchy graph
    transforms, edges = build_hierarchy_graph(data)
    
    print(f"Found {len(transforms)} unique transforms")
    print(f"Found {len(edges)} parent-child relationships")
    
    # Visualize
    visualize_transforms(transforms, edges)
    
    # Print some statistics
    print("\nSample world positions:")
    for i, (fid, transform) in enumerate(list(transforms.items())[:5]):
        pos = transform['world_pos']
        print(f"  {transform['name']}: ({pos[0]:.2f}, {pos[1]:.2f}, {pos[2]:.2f})")
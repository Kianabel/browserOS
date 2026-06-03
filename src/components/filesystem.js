const STORAGE_KEY = "browserOS:filesystem";
const ROOT_ID = "root";
const DESKTOP_ID = "desktop";

function now() {
  return Date.now();
}

function createDefaultTree() {
  const Timestamp = now();
  return {
    version: 2,
    rootId: ROOT_ID,
    nodes: {
      [ROOT_ID]: {
        id: ROOT_ID,
        type: "folder",
        name: "Root",
        parentId: null,
        children: [DESKTOP_ID],
        metadata: {
          iconColor: "#64748b",
        },
        createdAt: Timestamp,
        updatedAt: Timestamp,
      },
      [DESKTOP_ID]: {
        id: DESKTOP_ID,
        type: "folder",
        name: "Desktop",
        parentId: ROOT_ID,
        children: [],
        metadata: {
          iconColor: "#f59e0b",
          system: true,
        },
        createdAt: Timestamp,
        updatedAt: Timestamp,
      },
    },
  };
}

function createId(prefix = "node") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNode(id, node) {
  const Timestamp = now();
  const Type = node.type || "file";
  return {
    id,
    type: Type,
    name: String(node.name || "Untitled"),
    parentId: node.parentId ?? null,
    children: Type === "folder" ? Array.from(new Set(node.children || [])) : undefined,
    content: Type === "file" ? String(node.content || "") : undefined,
    target: node.target,
    metadata: node.metadata || {},
    createdAt: node.createdAt || Timestamp,
    updatedAt: node.updatedAt || Timestamp,
  };
}

function normalizeTree(tree) {
  if (!tree?.nodes?.[ROOT_ID]) return createDefaultTree();

  const nextTree = {
    version: 2,
    rootId: tree.rootId || ROOT_ID,
    nodes: {},
  };

  Object.entries(tree.nodes).forEach(([id, node]) => {
    nextTree.nodes[id] = normalizeNode(id, node);
  });

  if (!nextTree.nodes[DESKTOP_ID]) {
    const Timestamp = now();
    nextTree.nodes[DESKTOP_ID] = {
      id: DESKTOP_ID,
      type: "folder",
      name: "Desktop",
      parentId: ROOT_ID,
      children: [],
      metadata: {
        iconColor: "#f59e0b",
        system: true,
      },
      createdAt: Timestamp,
      updatedAt: Timestamp,
    };
  }

  const Root = nextTree.nodes[ROOT_ID];
  Root.type = "folder";
  Root.parentId = null;
  Root.children = Array.from(new Set([...(Root.children || []), DESKTOP_ID]))
    .filter((id) => Boolean(nextTree.nodes[id]) && id !== ROOT_ID);

  const Desktop = nextTree.nodes[DESKTOP_ID];
  Desktop.type = "folder";
  Desktop.parentId = ROOT_ID;
  Desktop.children = (Desktop.children || []).filter((id) => Boolean(nextTree.nodes[id]));
  Desktop.metadata = {
    iconColor: "#f59e0b",
    system: true,
    ...(Desktop.metadata || {}),
  };

  Object.values(nextTree.nodes).forEach((node) => {
    if (node.id === ROOT_ID) return;
    if (!node.parentId || !nextTree.nodes[node.parentId]) {
      node.parentId = DESKTOP_ID;
      nextTree.nodes[DESKTOP_ID].children = Array.from(new Set([
        ...(nextTree.nodes[DESKTOP_ID].children || []),
        node.id,
      ]));
    }
  });

  Object.values(nextTree.nodes).forEach((node) => {
    if (node.type !== "folder") return;
    node.children = (node.children || []).filter((childId) => {
      const Child = nextTree.nodes[childId];
      return Child && Child.parentId === node.id;
    });
  });

  return nextTree;
}

function loadTree() {
  try {
    return normalizeTree(JSON.parse(localStorage.getItem(STORAGE_KEY) || ""));
  } catch {
    return createDefaultTree();
  }
}

function saveTree(tree) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeTree(tree)));
}

function getNodeFromTree(tree, id) {
  return tree.nodes[id] || null;
}

function sortChildren(children) {
  return [...children].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
}

function getUniqueName(tree, parentId, requestedName, ignoredId = null) {
  const Parent = getNodeFromTree(tree, parentId);
  const BaseName = String(requestedName || "Untitled").trim() || "Untitled";
  if (!Parent || Parent.type !== "folder") return BaseName;

  const Existing = new Set((Parent.children || [])
    .filter((childId) => childId !== ignoredId)
    .map((childId) => getNodeFromTree(tree, childId)?.name)
    .filter(Boolean));

  if (!Existing.has(BaseName)) return BaseName;

  const DotIndex = BaseName.lastIndexOf(".");
  const Stem = DotIndex > 0 ? BaseName.slice(0, DotIndex) : BaseName;
  const Extension = DotIndex > 0 ? BaseName.slice(DotIndex) : "";
  let Index = 2;
  while (Existing.has(`${Stem} ${Index}${Extension}`)) {
    Index += 1;
  }
  return `${Stem} ${Index}${Extension}`;
}

function listChildren(parentId = DESKTOP_ID) {
  const Tree = loadTree();
  const Parent = getNodeFromTree(Tree, parentId);
  if (!Parent || Parent.type !== "folder") return [];

  return sortChildren((Parent.children || [])
    .map((id) => getNodeFromTree(Tree, id))
    .filter(Boolean));
}

function touchNode(tree, id) {
  const Node = getNodeFromTree(tree, id);
  if (Node) Node.updatedAt = now();
}

function createNode(parentId, node) {
  const Tree = loadTree();
  const Parent = getNodeFromTree(Tree, parentId);
  if (!Parent || Parent.type !== "folder") return null;

  const Timestamp = now();
  const Type = node.type || "file";
  const Id = node.id || createId(Type);
  const NextNode = normalizeNode(Id, {
    ...node,
    type: Type,
    name: getUniqueName(Tree, parentId, node.name),
    parentId,
    createdAt: Timestamp,
    updatedAt: Timestamp,
  });

  Tree.nodes[Id] = NextNode;
  Parent.children = [...(Parent.children || []), Id];
  touchNode(Tree, Parent.id);
  saveTree(Tree);
  return NextNode;
}

function createFolder(parentId, name = "New folder", metadata = {}) {
  return createNode(parentId, {
    type: "folder",
    name,
    metadata: {
      iconColor: "#f59e0b",
      ...metadata,
    },
  });
}

function createShortcut(parentId, app, metadata = {}) {
  return createNode(parentId, {
    type: "shortcut",
    name: app.name,
    target: {
      kind: "app",
      componentTag: app.componentTag,
    },
    metadata: {
      iconColor: app.iconColor || "#4f8cff",
      iconLabel: app.iconLabel || app.name,
      tag: app.tag || "App",
      ...metadata,
    },
  });
}

function createFile(parentId, name = "New file.txt", content = "", metadata = {}) {
  return createNode(parentId, {
    type: "file",
    name,
    content,
    metadata: {
      mimeType: "text/plain",
      iconColor: "#38bdf8",
      ...metadata,
    },
  });
}

function renameNode(id, name) {
  const NextName = String(name || "").trim();
  if (!NextName) return null;

  const Tree = loadTree();
  const Node = getNodeFromTree(Tree, id);
  if (!Node || Node.id === ROOT_ID) return null;
  Node.name = getUniqueName(Tree, Node.parentId, NextName, id);
  touchNode(Tree, id);
  saveTree(Tree);
  return Node;
}

function updateNode(id, patch) {
  const Tree = loadTree();
  const Node = getNodeFromTree(Tree, id);
  if (!Node) return null;

  const NextPatch = { ...patch };
  delete NextPatch.id;
  delete NextPatch.parentId;
  delete NextPatch.type;
  delete NextPatch.children;

  Tree.nodes[id] = {
    ...Node,
    ...NextPatch,
    metadata: {
      ...(Node.metadata || {}),
      ...(patch.metadata || {}),
    },
    updatedAt: now(),
  };
  saveTree(Tree);
  return Tree.nodes[id];
}

function isDescendant(tree, nodeId, maybeDescendantId) {
  let Current = getNodeFromTree(tree, maybeDescendantId);
  while (Current?.parentId) {
    if (Current.parentId === nodeId) return true;
    Current = getNodeFromTree(tree, Current.parentId);
  }
  return false;
}

function moveNode(id, parentId, metadata = {}) {
  const Tree = loadTree();
  const Node = getNodeFromTree(Tree, id);
  const NextParent = getNodeFromTree(Tree, parentId);
  if (!Node || !NextParent || NextParent.type !== "folder") return null;
  if (id === ROOT_ID || id === DESKTOP_ID || id === parentId) return null;
  if (Node.type === "folder" && isDescendant(Tree, id, parentId)) return null;

  const CurrentParent = getNodeFromTree(Tree, Node.parentId);
  if (CurrentParent) {
    CurrentParent.children = (CurrentParent.children || []).filter((childId) => childId !== id);
    touchNode(Tree, CurrentParent.id);
  }

  Node.parentId = parentId;
  Node.name = getUniqueName(Tree, parentId, Node.name, id);
  Node.metadata = {
    ...(Node.metadata || {}),
    ...metadata,
  };
  NextParent.children = [...(NextParent.children || []), id];
  touchNode(Tree, id);
  touchNode(Tree, NextParent.id);
  saveTree(Tree);
  return Node;
}

function deleteNode(id) {
  const Tree = loadTree();
  const Node = getNodeFromTree(Tree, id);
  if (!Node || id === ROOT_ID || id === DESKTOP_ID) return false;

  const Parent = getNodeFromTree(Tree, Node.parentId);
  if (Parent) {
    Parent.children = (Parent.children || []).filter((childId) => childId !== id);
    touchNode(Tree, Parent.id);
  }

  const removeRecursive = (nodeId) => {
    const Current = getNodeFromTree(Tree, nodeId);
    if (!Current) return;
    (Current.children || []).forEach(removeRecursive);
    delete Tree.nodes[nodeId];
  };
  removeRecursive(id);
  saveTree(Tree);
  return true;
}

function cloneNodeRecursive(tree, sourceId, parentId) {
  const Source = getNodeFromTree(tree, sourceId);
  if (!Source) return null;

  const Id = createId(Source.type);
  const Timestamp = now();
  const Clone = normalizeNode(Id, {
    ...Source,
    id: Id,
    parentId,
    name: getUniqueName(tree, parentId, Source.name),
    children: Source.type === "folder" ? [] : undefined,
    createdAt: Timestamp,
    updatedAt: Timestamp,
  });

  tree.nodes[Id] = Clone;
  if (Source.type === "folder") {
    Clone.children = (Source.children || [])
      .map((childId) => cloneNodeRecursive(tree, childId, Id)?.id)
      .filter(Boolean);
  }
  return Clone;
}

function duplicateNode(id, parentId = null) {
  const Tree = loadTree();
  const Source = getNodeFromTree(Tree, id);
  if (!Source || Source.id === ROOT_ID) return null;
  const TargetParentId = parentId || Source.parentId;
  const Parent = getNodeFromTree(Tree, TargetParentId);
  if (!Parent || Parent.type !== "folder") return null;

  const Clone = cloneNodeRecursive(Tree, id, TargetParentId);
  Parent.children = [...(Parent.children || []), Clone.id];
  touchNode(Tree, Parent.id);
  saveTree(Tree);
  return Clone;
}

function getPath(id) {
  const Tree = loadTree();
  const Path = [];
  let Current = getNodeFromTree(Tree, id);
  while (Current) {
    Path.unshift(Current);
    Current = Current.parentId ? getNodeFromTree(Tree, Current.parentId) : null;
  }
  return Path;
}

function exportTree() {
  return JSON.stringify(loadTree(), null, 2);
}

function importTree(json) {
  try {
    const Tree = normalizeTree(JSON.parse(json));
    saveTree(Tree);
    return true;
  } catch {
    return false;
  }
}

function resetTree() {
  const Tree = createDefaultTree();
  saveTree(Tree);
  return Tree;
}

function migrateLegacyDesktopItems() {
  const Legacy = localStorage.getItem("browserOS:desktop-items");
  if (!Legacy) return;

  let Items = [];
  try {
    Items = JSON.parse(Legacy);
  } catch {
    localStorage.removeItem("browserOS:desktop-items");
    return;
  }

  const Existing = listChildren(DESKTOP_ID);
  if (Existing.length === 0) {
    Items.forEach((item) => {
      if (item.type === "folder") {
        createFolder(DESKTOP_ID, item.name || "Folder", {
          x: item.x || 24,
          y: item.y || 24,
          iconColor: item.iconColor || "#f59e0b",
        });
      } else if (item.type === "app") {
        createShortcut(DESKTOP_ID, {
          name: item.name,
          componentTag: item.componentTag,
          iconColor: item.iconColor || "#4f8cff",
          iconLabel: item.name,
          tag: "App",
        }, {
          x: item.x || 24,
          y: item.y || 24,
        });
      }
    });
  }

  localStorage.removeItem("browserOS:desktop-items");
}

export const FileSystem = {
  DESKTOP_ID,
  ROOT_ID,
  createFile,
  createFolder,
  createShortcut,
  deleteNode,
  duplicateNode,
  exportTree,
  getNode: (id) => getNodeFromTree(loadTree(), id),
  getPath,
  getUniqueName: (parentId, name) => getUniqueName(loadTree(), parentId, name),
  importTree,
  listChildren,
  loadTree,
  migrateLegacyDesktopItems,
  moveNode,
  renameNode,
  resetTree,
  saveTree,
  updateNode,
};

// Step 1: Switch to Legal Documents Database
use legalDocsDB;

// Step 2: Insert Legal Documents with Pre-computed Vector Embeddings (illustrative 4-dim vectors)
db.contracts.insertMany([
  {
    docId: "LEG-101",
    title: "Non-Disclosure Agreement - TechCorp",
    clauseType: "Confidentiality",
    text: "The receiving party shall not disclose proprietary trade secrets to any third party for five years.",
    embedding: [0.12, 0.85, -0.33, 0.44]
  },
  {
    docId: "LEG-102",
    title: "Master Services Agreement - Apex",
    clauseType: "Termination",
    text: "Either party may terminate this agreement upon 30 days written notice in the event of a material breach.",
    embedding: [-0.65, 0.21, 0.78, -0.10]
  }
]);

// Step 3: Create Atlas Vector Search Index Definition
db.contracts.createSearchIndex(
  "vector_index",
  "vectorSearch",
  {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: 4,
        similarity: "cosine"
      }
    ]
  }
);

// Step 4: Semantic Search Query (Natural language query: "rules about keeping company secrets private")
// Query vector generated from user prompt: [0.14, 0.82, -0.30, 0.41]
db.contracts.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.14, 0.82, -0.30, 0.41],
      numCandidates: 10,
      limit: 2
    }
  },
  {
    $project: {
      _id: 0,
      docId: 1,
      title: 1,
      clauseType: 1,
      text: 1,
      similarityScore: { $meta: "vectorSearchScore" }
    }
  }
]);

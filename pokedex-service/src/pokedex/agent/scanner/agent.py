from langgraph.graph import StateGraph

from pokedex.agent.scanner.schema import ScannerState
from pokedex.agent.scanner.nodes import analyze_image, verify_creature


# Define the graph
graph = StateGraph(ScannerState)
graph.add_node("analyze_image", analyze_image)
graph.add_node("verify_creature", verify_creature)

graph.set_entry_point("analyze_image")
graph.add_edge("analyze_image", "verify_creature")
graph.set_finish_point("verify_creature")

scanner_agent = graph.compile()

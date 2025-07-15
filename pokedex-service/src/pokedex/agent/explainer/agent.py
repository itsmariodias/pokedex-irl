from langgraph.graph import StateGraph

from pokedex.agent.explainer.schema import ExplainerState
from pokedex.agent.explainer.nodes import explain_creature


# Define the graph
graph = StateGraph(ExplainerState)
graph.add_node(
    "explain_creature", explain_creature
)  # TODO consider adding a wiki search tool

graph.set_entry_point("explain_creature")
graph.set_finish_point("explain_creature")

explainer_agent = graph.compile()

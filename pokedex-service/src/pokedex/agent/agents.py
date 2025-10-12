from dataclasses import dataclass

from langgraph.graph.state import CompiledStateGraph

from pokedex.agent.scanner.agent import scanner_agent
from pokedex.agent.explainer.agent import explainer_agent


@dataclass
class Agent:
    description: str
    graph: CompiledStateGraph


agents: dict[str, Agent] = {
    "scanner-agent": Agent(
        description="A scanner agent which identifies the creature (if present) from the image",
        graph=scanner_agent,
    ),
    "explainer-agent": Agent(
        description="A explainer agent which gives a detailed explanation of the creature",
        graph=explainer_agent,
    ),
}


def get_agent(agent_name: str) -> CompiledStateGraph:
    return agents[agent_name].graph

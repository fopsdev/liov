import { Component } from "preact";

export class Devtools {
  constructor() {
    this.mutations = [];
    this.components = {};
    this.mutationListeners = [];
    this.componentListeners = [];
  }
  addMutations(actionName, mutations) {
    this.mutations.unshift({
      actionName,
      mutations
    });
    this.mutationListeners.forEach(cb => cb(this.mutations));
  }
  addComponent(id, name, paths) {
    if (this.components[id]) {
      this.components[id].paths = paths;
      this.components[id].renderCount++;
    } else {
      this.components[id] = {
        name,
        paths,
        renderCount: 1
      };
    }
    this.componentListeners.forEach(cb => cb(this.components));
  }
  removeComponent(id) {
    delete this.components[id];
    this.componentListeners.forEach(cb => cb(this.components));
  }
  addMutationListener(listener) {
    this.mutationListeners.push(listener);
  }
  addComponentListener(listener) {
    this.componentListeners.push(listener);
  }
}

export class DevtoolsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mutations: [],
      components: {}
    };
  }
  componentWillMount() {
    this.context.library.devtools.addMutationListener(mutations => {
      this.setState({
        mutations
      });
    });
    this.context.library.devtools.addComponentListener(components => {
      this.setState({
        components
      });
    });
  }
  render() {
    const style = {
      position: "fixed",
      right: 0,
      top: 0,
      backgroundColor: "#eaeaea",
      height: "100vh",
      minWidth: "200px",
      borderLeft: "1px solid #dadada",
      padding: "10px",
      overflowY: 'scroll'
    };

    return (
      <div style={style}>
        <h4># Components</h4>
        {Object.keys(this.state.components).map(componentId => {
          const component = this.state.components[componentId];
          return (
            <div>
              <div>
                <strong>{component.name} ({component.renderCount})</strong>
              </div>
              <div>
                {Array.from(component.paths).map(path => {
                  return <div>{path}</div>;
                })}
              </div>
            </div>
          );
        })}
        <h4># Mutations</h4>
        {this.state.mutations.map(mutation => (
          <div>
            <div>
              <strong>{mutation.actionName}</strong>
            </div>
            <div>
              {mutation.mutations.map(mutation => {
                return (
                  <div>
                    <i>{mutation.method}</i> {mutation.path}{" "}
                    {JSON.stringify(mutation.args)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

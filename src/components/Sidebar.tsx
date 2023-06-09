import React from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {FaCompress, FaExpand, FaHome} from "react-icons/fa";
import {Accordion} from "react-bootstrap";
import SidebarItems from "./SidebarItems";
import getMockerURL from "../util/envreader";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageJson from "../../package.json";

interface IProps {
    history: {
        location: {
            pathname: string;
        };
        push(url: string): void;
    };
}

interface IState {
    domains: {
        configuration: boolean;
        simulation: boolean;
    };
    versions: {
        mocker: string;
        mockConfig: string;
    };
}



export default class Sidebar extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            domains: {
                configuration: true,
                simulation: false,
            },
            versions: {
                mocker: "",
                mockConfig: "",
            }
        };
    }

    componentDidMount(): void {

        // workaround for react according gap
        SidebarItems.forEach(item => {
            if (this.props.history.location.pathname.split("/")[1] === item.route.substring(1)) {
                const headings: Array<Element> = Array.from(document.getElementsByClassName("navbar-heading"));
                headings.forEach((heading: Element) => {
                    const textContent = heading.textContent;
                    if (textContent !== null && textContent.toLowerCase().indexOf(item.domain) !== -1) {
                        const parent = heading.parentElement;
                        if (parent !== null) {
                            const sibling = parent.nextElementSibling;
                            if (sibling !== null) {
                                sibling.classList.add("show");
                                this.setDomainState(item.domain);
                            }
                        }
                    }
                });
            }
        });
    }

    handleAccordion(activeIndex: any) {
        // workaround for react according gap
        const listGroupList: Array<Element> = Array.from(document.getElementsByClassName("list-group"));
        listGroupList.forEach((listGroup: Element, index: number) => {
            if (activeIndex !== index) {
                const collapse = listGroup.closest(".collapse");
                if (collapse !== null) {
                    collapse.classList.remove("show");
                }
            }
        });
    }

    setDomainState(domain: string) {
        Object.keys(this.state.domains).forEach((key: string) => {
            const domains: any = this.state.domains;
            domains[key] = key === domain;
            this.setState({domains});
        });
    }

    getMockerInfo(): void {
        axios.get(`${getMockerURL()}info`)
        .then((res) => {
            if (res.status === 200) {
                let versions = this.state.versions;
                versions.mockConfig = res.data.version;
                this.setState({ versions });
            }
        });
    }

    getMockConfigInfo(): void {
        axios.get(`${getMockerURL()}config/info`)
        .then((res) => {
            if (res.status === 200) {
                let versions = this.state.versions;
                versions.mockConfig = res.data.version;
                this.setState({ versions });
            }
        });
    }


    render(): React.ReactNode {
        const location = this.props.history.location;

        const domains: any = this.state.domains;

        function getClass(item: any) {
            return getPath(location.pathname).split("/")[1] === item.route.substring(1) && getPath(location.pathname).includes(getPath(item.route)) ? "active" : "";
        }

        function getPath(path: string) {
            return path.charAt(0) !== "/" ? "/" + path : path;
        }

        function getCompressionClass(domain: string, expand: boolean) {
            return domains[domain] === expand ? "d-inline" : "d-none";
        }

        function getLink(item: any) {
            return (
                <Link to={item.route} key={item.name} className={`list-group-item-action ${getClass(item)}`}>
                    <span>{item.name}</span>
                </Link>
            );
        }

        return (
            <>
                <Link to={"/"} key={"home"} className={`list-group-item-action `}>
                    <div className="ml-1">
                        <FaHome></FaHome> <span className="ml-1">Home</span>
                    </div>
                </Link>
                <Accordion onSelect={(activeIndex) => this.handleAccordion(activeIndex)}>
                    <span>
                        <Accordion.Toggle as="div" eventKey="0">
                            <span className="navbar-heading" onClick={() => this.setDomainState("configuration")}>
                                <FaExpand className={`ml-2 mr-2 ${getCompressionClass("configuration", true)}`}/>
                                <FaCompress className={`ml-2 mr-2 ${getCompressionClass("configuration", false)}`}/>
                                Configuration
                            </span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <div className="list-group">
                            {
                                SidebarItems.filter(item => item.domain === "configuration").map((item) => getLink(item))
                            }
                            </div>
                        </Accordion.Collapse>
                    </span>
                    <span>
                        <Accordion.Toggle as="div" eventKey="1">
                            <span className="navbar-heading" onClick={() => this.setDomainState("simulation")}>
                                <FaExpand className={`ml-2 mr-2 ${getCompressionClass("simulation", true)}`}/>
                                <FaCompress className={`ml-2 mr-2 ${getCompressionClass("simulation", false)}`}/>
                                Simulation
                            </span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="1">
                            <div className="list-group">
                            {
                                SidebarItems.filter(item => item.domain === "simulation").map((item) => getLink(item))
                            }
                            </div>
                        </Accordion.Collapse>
                    </span>
                </Accordion>
                <div className={"info-box"}>
                    <div>Portal version: {packageJson.version} </div>
                    {/*
                    <div>Mock configurator version: {this.state.versions.mockConfig} </div>
                    <div>Mocker version: {this.state.versions.mocker} </div>
                    */}
                    Made with ❤️ by PagoPA S.p.A.
                </div>
            </>
        );
    }
}


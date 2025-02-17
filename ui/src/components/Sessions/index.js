import React from "react";
import { Link } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { StyledSessions } from "./style.css";
import BeatLoader from "react-spinners/BeatLoader";

import styled from "styled-components/macro";
import { useSessionDelete } from "./service";

const Sessions = ({ sessions = {}, query = "" }) => {
    function withQuery(query, sessions) {
        return id => {
            if (id.includes(query)) {
                return true;
            }

            if (sessions[id].caps.name && sessions[id].caps.name.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }

            if (sessions[id].caps.browserName.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }

            return query === "";
        };
    }

    const ids = Object.keys(sessions)
        .filter(withQuery(query, sessions))
        // moving manual on top
        // can be moved to golang actually
        .sort(a => (sessions[a].caps.labels && sessions[a].caps.labels.manual ? -1 : 1));

    return (
        <StyledSessions>
            <div className={`section-title section-title_hidden-${!!query}`}>Sessions</div>
            <TransitionGroup className="sessions__list">
                {ids.map(id => {
                    return (
                        <CSSTransition key={id} timeout={500} classNames="session_state" unmountOnExit>
                            <Session id={id} session={sessions[id]} />
                        </CSSTransition>
                    );
                })}
            </TransitionGroup>
            <CSSTransition
                in={!ids.length}
                timeout={500}
                exit={false}
                classNames="sessions__no-any_state"
                unmountOnExit
            >
                <div className="no-any">
                    <div title="No any" className="icon dripicons-hourglass" />
                    <div className="nosession-any-text">NO SESSIONS YET :'(</div>
                </div>
            </CSSTransition>
        </StyledSessions>
    );
};

const Session = ({ id, session: { quota, caps } }) => {
    const [deleting, deleteSession] = useSessionDelete(id);

    return (
        <div className={`session ${(caps.labels && caps.labels.manual && "session_manual") || ""}`}>
            <SessionId>
                <span className="quota">{quota}</span> /{" "}
                <Link to={deleting ? `#` : `/sessions/${id}`} className="id">
                    {id.substring(0, id.indexOf("-"))}
                </Link>
            </SessionId>
            <Link className="identity" to={deleting ? `#` : `/sessions/${id}`}>
                <div className="browser">
                    <span className="name">{caps.browserName}</span>
                    <span className="version">{caps.version}</span>
                </div>

                {caps.name && (
                    <div className="session-name" title={caps.name}>
                        {caps.name}
                    </div>
                )}
            </Link>

            <Capabilities>
                {caps.labels && caps.labels.manual && <span className="capability capability__manual">MANUAL</span>}
                {caps.enableVNC && <span className="capability">VNC</span>}
                {caps.screenResolution && (
                    <span className="capability  capability__resolution">{caps.screenResolution}</span>
                )}
            </Capabilities>
            <Actions>
                {caps.labels && caps.labels.manual && (
                    <div className="capability capability__session-delete" onClick={deleteSession}>
                        {deleting ? (
                            <BeatLoader size={2} color={"#fff"} />
                        ) : (
                            <span title="Delete" className="icon dripicons-trash" />
                        )}
                    </div>
                )}
            </Actions>
        </div>
    );
};

const primaryColor = "#fff";
const secondaryColor = "#aaa";

const SessionId = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-basis: 140px;
    padding-right: 5px;

    .quota {
        color: ${secondaryColor};
        margin-right: 3px;
    }

    .id {
        margin-left: 3px;
        text-decoration: none;
        color: ${primaryColor};
    }
`;

const Capabilities = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
`;

export default Sessions;

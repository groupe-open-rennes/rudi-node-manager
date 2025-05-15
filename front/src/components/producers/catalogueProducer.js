import React, { useContext, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useDefaultErrorHandler from '../../utils/useDefaultErrorHandler'
import { BackConfContext } from '../../context/backConfContext'
import axios from 'axios'
import {EditObjCard} from "../generic/objCard";
import {ProducerCard} from "./producerCard";

const PAGE_SIZE = 20

/**
 * Composant : CatalogueProducer
 * @return {void}
 */
export default function CatalogueProducer({ editMode, logout }) {
  const { defaultErrorHandler } = useDefaultErrorHandler()
  const { backConf } = useContext(BackConfContext)
  const [back, setBack] = useState(backConf)
  useEffect(() => setBack(backConf), [backConf])

  const [isEdit, setIsEdit] = useState(!!editMode)
  useEffect(() => setIsEdit(editMode), [editMode])

  const [producerList, setProducerList] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(-1)
  const initialRender = useRef(true)

  const getCatalogUrlObj = (suffix) => back?.isLoaded && back.getBackCatalog('organizations', suffix)
  const deleteUrl = (id) => getCatalogUrlObj(id)

  const [sortBy, setSortBy] = useState('-updatedAt')
  useEffect(() => setSortBy('-updatedAt'), ['-updatedAt'])

  const refresh = () => {
    setHasMore(true)
    setProducerList([])
    getInitialData()

    if (currentOffset === 0) {
      setCurrentOffset(-1)
    } else {
      setCurrentOffset(0)
    }
  }
  useEffect(() => refresh(), [false])

  const [isTabVisible, setIsTabVisible] = useState(true)
  document.addEventListener('visibilitychange', () => {
    setIsTabVisible(document.visibilityState === 'visible')
  })
  useEffect(() => {
    if (isTabVisible) refresh()
  }, [isTabVisible])

  useEffect(() => {
    if (initialRender.current) initialRender.current = false
    else if (currentOffset < 0) setCurrentOffset(0)
    else fetchMoreData()
  }, [currentOffset])

  /**
   * recup la 1er page
   */
  function getInitialData() {
    axios
      .get(getCatalogUrlObj(), {
        params: { sort_by: sortBy, limit: PAGE_SIZE, offset: 0 },
      })
      .then((res) => {
        if (res.data?.length < PAGE_SIZE) setHasMore(false)
      })
      .catch((err) => (err.response?.status == 401 ? logout() : defaultErrorHandler(err)))
  }

  /**
   * Fonction utilisée par InfiniteScroll
   * Récupere la page suivante
   */
  const fetchMoreData = () => {
    axios
      .get(getCatalogUrlObj(), {
        params: { sort_by: sortBy, limit: PAGE_SIZE, offset: currentOffset },
      })
      .then((res) => {
        const data = res.data
        if (data.length < PAGE_SIZE) setHasMore(false)
        setProducerList((producers) => producers.concat(data))
      })
      .catch((err) => (err.response?.status == 401 ? logout() : defaultErrorHandler(err)))
  }
  //hideEdit: producer['organization_status'] !== "VALIDATED"
  return (
    <div className={'tempPaddingTop'}>
      <div className="row catalogue">
        <div className="col-9">
          <div className="row">
            {isEdit && (
              <EditObjCard
                objType="organizations"
                idField="organization_id"
                deleteUrl={deleteUrl}
                deleteConfirmMsg={(id) => `Confirmez vous la suppression du producteur ${id}?`}
                deleteMsg={(id) => `Le producteur ${id} a été supprimé`}
                btnTextAdd="Ajouter un producteur"
                btnTextChg="Modifier un producteur :"
                refresh={refresh}
              ></EditObjCard>
            )}
            <InfiniteScroll
              dataLength={producerList.length}
              next={() => setCurrentOffset(currentOffset + PAGE_SIZE)}
              hasMore={hasMore}
              loader={<h4>Loading...</h4>}
              endMessage={<i>Aucune donnée supplémentaire</i>}
            >
              {producerList.map((producer) => (
                <ProducerCard
                  editMode={isEdit}
                  hideEdit={true}
                  producer={producer}
                  propId="organization_id"
                  propName="organization_name"
                  displayFields={{
                    organization_id: "Identifiant de l'organisation",
                    organization_caption: 'Nom complet',
                    organization_summary: 'Description',
                    organization_address: 'Adresse',
                  }}
                  deleteUrl={deleteUrl}
                  deleteConfirmMsg={(id) => `Confirmez vous la suppression du producteur ${id}?`}
                  deleteMsg={(id) => `Le producteur ${id} a été supprimé`}
                  refresh={refresh}
                  key={`${producer['organization_id']}`}
                ></ProducerCard>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  )
}
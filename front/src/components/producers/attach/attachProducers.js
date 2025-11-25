import React, { useContext, useEffect, useState } from 'react'
import { SearchProducers } from '../search-producer/searchProducers'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ProducerCard } from '../producer-card/producerCard'
import useDefaultErrorHandler from '../../../utils/useDefaultErrorHandler'
import { BackConfContext } from '../../../context/backConfContext'
import axios from 'axios'
import { Loader } from '../../other/loader/loader'

// const PAGE_SIZE = 20
const PAGE_SIZE = 4

export default function AttachProducers({ logout }) {
  const [searchResults, setSearchResults] = useState(null)
  const [name, setName] = useState('')
  const [uuid, setUuid] = useState('')

  const [sortBy, setSortBy] = useState('-updatedAt')
  const [currentOffset, setCurrentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [displayLoader, setDisplayLoader] = useState(true)

  const { defaultErrorHandler } = useDefaultErrorHandler()
  const { backConf } = useContext(BackConfContext)
  const [back, setBack] = useState(backConf)
  useEffect(() => setBack(backConf), [backConf])
  useEffect(() => {
    if (currentOffset < 0) {
      setCurrentOffset(0)
    }

    if (name || uuid) {
      search()
    }
  }, [currentOffset])

  const searchCatalogOrganisationUrl = (suffix) =>
    back?.isLoaded && back.getBackCatalog('/portal/organizations', suffix)
  const attachOrganizationUrl = (id) => back?.isLoaded && back.getBackCatalog('/portal/attach/organizations', id)

  const handleCriteria = async ({ searchUuid, searchName }) => {
    setUuid(searchUuid)
    setName(searchName)
    setHasMore(true)
    setCurrentOffset(0)
    setSearchResults([])

    await search(searchUuid, searchName)
  }

  const search = async (cardUuid = uuid, cardName = name) => {
    if(displayLoader){
      setIsLoading(true)
    }
    try {
      await axios
        .get(searchCatalogOrganisationUrl(), {
          params: {
            id: cardUuid,
            name: cardName,
            sort_by: sortBy,
            limit: PAGE_SIZE,
            offset: currentOffset,
          },
        })
        .then((res) => {
          if (res.data?.total < PAGE_SIZE || res.data?.elements.length < PAGE_SIZE) {
            setHasMore(false)
          }
          setIsLoading(false)

          let results = res.data?.elements ?? undefined
          if (results) {
            setSearchResults((values) => values.concat(results))
          }
        })
        .catch((err) => {
          setIsLoading(false)
          defaultErrorHandler(err)
        })
    } catch (err) {
      defaultErrorHandler(err)
    }
  }

  const endListMessage = () => {
    return searchResults && searchResults.length ===0 ?<i>Aucune organisation trouvée pour cette recherche.</i> : <i>Aucune donnée supplémentaire</i>
  }

  return (
    <div className={'tempPaddingTop'}>
      <div className="row catalogue">
        <div className="col-2"></div>
        <div className="col-8">
          <div className="row">
            <SearchProducers handleCriteria={handleCriteria}></SearchProducers>
          </div>
          {!isLoading && searchResults && (
            <div className="row my-5">
              <h1>Résultats</h1>
                <InfiniteScroll
                  dataLength={searchResults.length}
                  hasMore={hasMore}
                  next={() => {
                    setCurrentOffset(currentOffset + PAGE_SIZE)
                    setDisplayLoader(false)
                  }}
                  loader={<Loader fullScreen={false} size={'sm'}></Loader>}
                  endMessage={endListMessage()}
                >
                  {searchResults.map((producer) => (
                    <ProducerCard
                      editMode={false}
                      hideEdit={true}
                      producer={producer}
                      key={`${producer['organization_id']}`}
                      propId="organization_id"
                      propName="organization_name"
                      displayFields={{
                        organization_id: "Identifiant de l'organisation",
                        organization_caption: 'Nom complet',
                        organization_summary: 'Description',
                        organization_address: 'Adresse',
                      }}
                      attachUrl={attachOrganizationUrl}
                    ></ProducerCard>
                  ))}
                </InfiniteScroll>
            </div>
          )}
          {isLoading && displayLoader && <Loader fullScreen={true} size={'md'}></Loader>}
        </div>
      </div>
    </div>
  )
}

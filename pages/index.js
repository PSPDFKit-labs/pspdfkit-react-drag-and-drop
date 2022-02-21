import React, { useCallback, useEffect, useRef } from "react";

export default function App() {
  const containerRef = useRef(null);
  const dropzoneRef = useRef(null);
  const instance = useRef(null);
  const PSPDFKit = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      PSPDFKit.current = await import("pspdfkit");
      instance.current = await PSPDFKit.current.load({
        container,
        document: "/example.pdf",
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
        theme: PSPDFKit.current.Theme.DARK,
      });
    })();

    return () => PSPDFKit.current && PSPDFKit.current.unload(container);
  }, []);

  const handleDragStart = useCallback(
    (ev) => {
      if (!dropzoneRef.current) return;

      dropzoneRef.current.classList.add("drag-over");
      ev.dataTransfer.setData("text/plain", ev.target.src);
    },
    [dropzoneRef.current]
  );

  const handleDrop = useCallback(
    (ev) => {
      if (!PSPDFKit.current || !instance.current) return;

      (async function () {
        ev.preventDefault();
        // Get the id of the target and add the moved element to the target's DOM
        const img = ev.dataTransfer.getData("text/plain");

        const image = await fetch(img);
        const blob = await image.blob();

        const imageAttachmentId = await instance.current.createAttachment(blob);
        const pointInPage = await instance.current.transformClientToPageSpace(
          new PSPDFKit.current.Geometry.Point({
            x: ev.clientX,
            y: ev.clientY,
          }),
          instance.current.viewState.currentPageIndex
        );

        const annotation = new PSPDFKit.current.Annotations.ImageAnnotation({
          pageIndex: instance.current.viewState.currentPageIndex,
          contentType: "image/jpeg",
          imageAttachmentId,
          description: "Example Image Annotation",
          boundingBox: new PSPDFKit.current.Geometry.Rect({
            left: pointInPage.x - 100,
            top: pointInPage.y - 70,
            width: 200,
            height: 135,
          }),
        });

        await instance.current.create(annotation);
        dropzoneRef.current.classList.remove("drag-over");
      })();
    },
    [
      dropzoneRef.current,
      instance.current,
      PSPDFKit.current,
    ]
  );

  return (
    <div>
      <div className="images">
        <img
          onDragStart={handleDragStart}
          draggable="true"
          src="https://source.unsplash.com/6w3hF2r9gqk/300x200"
        />
        <img
          onDragStart={handleDragStart}
          draggable="true"
          src="https://source.unsplash.com/vuOxADFnnQ4/300x200"
        />
        <img
          onDragStart={handleDragStart}
          draggable="true"
          src="https://source.unsplash.com/kYIrsmX3YIA/300x200"
        />
        <img
          onDragStart={handleDragStart}
          draggable="true"
          src="https://source.unsplash.com/7S9k69vO8ZY/300x200"
        />
        <img
          onDragStart={handleDragStart}
          draggable="true"
          src="https://source.unsplash.com/HQL-zncwP34/300x200"
        />
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={(ev) => {
          ev.preventDefault();
        }}
      >
        <div ref={dropzoneRef}>
          <div
            ref={containerRef}
            style={{
              height: "calc(100vh - 165px)",
              backgroundColor: "#4d525d",
            }}
          />
        </div>
      </div>

      <style global jsx>
        {`
          * {
            margin: 0;
            padding: 0;
          }

          .drag-over {
            pointer-events: none;
          }
        `}
      </style>

      <style jsx>{`
        .images {
          padding: 15px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #444;
          display: flex;
          flex-direction: row;
          gap: 15px;
        }

        .images img {
          width: 200px;
          border-radius: 4px;
          cursor: move;
          box-shadow: 0px 1px 1px 1px #6868682e;
        }
      `}</style>
    </div>
  );
}
